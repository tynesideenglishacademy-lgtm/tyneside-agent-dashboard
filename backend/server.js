import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { processIncomingEmail, syncAllAcademyInboxes, liveIngestedEmails } from './email_listener.js';
import { globalApiLimiter, sensitiveActionLimiter } from './src/middleware/rateLimiter.js';
import { uploadValidator } from './src/middleware/uploadValidator.js';
import { logAuditEvent } from './src/utils/auditLogger.js';
import { performAgentWebReach } from './src/services/agentReach.js';
import sandboxRoutes from './src/routes/sandboxRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Apply Global Rate Limiter to all /api/ endpoints
app.use('/api/', globalApiLimiter);

// Initialize Supabase Connection (Connected directly to Tyneside CRM DB)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

/**
 * The Agent Dashboard can read email, agent tasks, approvals and CRM-backed
 * operational data through a service-role client. Every API route therefore
 * requires a verified Supabase user and the trusted server-controlled Admin
 * app_metadata role. Never trust a role supplied by the browser.
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Agent Dashboard database connection is not configured.' });
    }

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) return res.status(401).json({ error: 'Authentication required.' });

    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    let role = user.app_metadata?.role || '';
    if (role !== 'Admin') {
      const { data: staff } = await supabase
        .from('staff')
        .select('role')
        .or(`auth_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle();
      role = staff?.role || role;
    }

    if (role !== 'Admin') {
      return res.status(403).json({ error: 'Administrator access required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[auth] Admin verification failed:', error?.message || error);
    return res.status(401).json({ error: 'Could not verify administrator session.' });
  }
};

// All Agent Dashboard API endpoints are admin-only.
app.use('/api', requireAdmin);

// Mount Sandbox Routes only after the global admin guard.
app.use('/api/sandbox', sandboxRoutes);

// Determine LLM Provider (NVIDIA NIM vs OpenAI)
const isNvidia = !!(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'placeholder_key');
const isOpenAI = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder_key');

const apiKey = isNvidia ? process.env.NVIDIA_API_KEY : (process.env.OPENAI_API_KEY || 'placeholder_key');
const baseURL = isNvidia ? 'https://integrate.api.nvidia.com/v1' : undefined;
const defaultModelName = isNvidia 
  ? (process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct') 
  : (process.env.OPENAI_MODEL || 'gpt-4o');

const openai = new OpenAI({ apiKey, baseURL });

// 1. CEO CHAT ENDPOINT
app.post('/api/ceo/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    let { data: agents } = await supabase.from('agent_registry').select('id, name, division, system_prompt, model_preference');
    if (!agents || agents.length === 0) {
      agents = [
        { name: 'Legal Counsel', division: 'finance_ops', model_preference: 'meta/llama-3.3-70b-instruct' },
        { name: 'Debt Collector', division: 'finance_ops', model_preference: 'meta/llama-3.3-70b-instruct' },
        { name: 'Lesson Architect', division: 'academic', model_preference: 'deepseek-ai/deepseek-r1' },
        { name: 'Substitute Scheduler', division: 'academic', model_preference: 'meta/llama-3.1-8b-instruct' }
      ];
    }

    const agentListText = agents.map(a => `- ${a.name} (${a.division}) [Model: ${a.model_preference || 'Llama 3.3 70B'}]`).join('\n');

    const systemPrompt = `You are the Master CEO Agent of Tyneside English Academy.
Your job is to read the user's prompt and decide how to delegate tasks to your specialized sub-agents.
Available agents:
${agentListText}

Respond with a JSON object exactly in this format:
{
  "reply": "Your conversational reply back to the user acknowledging the request.",
  "delegations": [
    {
      "agent_name": "Name of the agent",
      "task": "Specific instructions for this agent"
    }
  ]
}`;

    let ceoReply = "I have received your request and logged it to the agent network.";
    let delegations = [];

    if (isNvidia || isOpenAI) {
      const completion = await openai.chat.completions.create({
        model: defaultModelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        response_format: { type: 'json_object' }
      });
      
      const result = JSON.parse(completion.choices[0].message.content);
      ceoReply = result.reply;
      delegations = result.delegations || [];
    }

    // Save tasks to Supabase if possible
    try {
      for (const del of delegations) {
        const agent = agents.find(a => a.name === del.agent_name);
        await supabase.from('agent_tasks').insert({
          assigned_agent_id: agent?.id || null,
          title: del.task,
          payload: { original_message: message, assigned_agent: del.agent_name },
          status: 'pending'
        });
      }
    } catch (e) {}

    // Log CEO Delegation Audit Event
    await logAuditEvent({
      req,
      agentName: 'CEO_MASTER_AGENT',
      action: 'DELEGATE_TASKS',
      resourceType: 'agent_tasks',
      status: 'EXECUTED',
      metadata: { prompt: message, delegated_count: delegations.length }
    });

    res.json({ reply: ceoReply, delegations, provider: isNvidia ? 'NVIDIA NIM' : 'OpenAI' });

  } catch (error) {
    console.error('Error in CEO Chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1B. AUDIT LOGS FETCH ENDPOINT
app.get('/api/audit-logs', async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return res.json({ logs: [], warning: error.message });
    }

    res.json({ logs: logs || [] });
  } catch (error) {
    res.json({ logs: [] });
  }
});

// 1C. AGENT WEB REACH LIVE SEARCH ENDPOINT
app.post('/api/agent/web-search', async (req, res) => {
  try {
    const { query, platform = 'all' } = req.body;
    if (!query) return res.status(400).json({ error: 'Search query is required' });

    const results = await performAgentWebReach(query, platform);

    // Audit log web search activity
    await logAuditEvent({
      req,
      agentName: 'AGENT_REACH_SEARCH',
      action: 'WEB_SEARCH',
      resourceType: 'web_index',
      status: 'EXECUTED',
      metadata: { query, platform, result_count: results.length }
    });

    res.json({ query, platform, results });
  } catch (error) {
    console.error('Error in Agent Reach search endpoint:', error);
    res.status(500).json({ error: 'Failed live web search' });
  }
});

// 2. DIRECT SUB-AGENT INTERACTION ENDPOINT
app.post('/api/agent/:agentId/chat', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    let systemPrompt = `You are a specialized agent (${agentId}) for Tyneside English Academy. Respond concisely and professionally.`;
    let modelToUse = defaultModelName;

    try {
      const { data: dbAgent } = await supabase.from('agent_registry').select('*').ilike('name', `%${agentId}%`).single();
      if (dbAgent) {
        if (dbAgent.system_prompt) systemPrompt = dbAgent.system_prompt;
        if (dbAgent.model_preference) modelToUse = dbAgent.model_preference;
      }
    } catch (e) {}

    console.log(`🤖 Agent Execution: [${agentId}] running on model [${modelToUse}]`);

    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply, modelUsed: modelToUse });
  } catch (error) {
    console.error(`Error in direct agent chat [${req.params.agentId}]:`, error);
    res.status(500).json({ error: 'Failed agent execution' });
  }
});

// 3. FETCH LIVE AGENT TASKS
app.get('/api/agent/:agentId/tasks', async (req, res) => {
  try {
    const { data: tasks } = await supabase
      .from('agent_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    res.json({ tasks: tasks || [] });
  } catch (error) {
    res.json({ tasks: [] });
  }
});

// 4. LIVE DASHBOARD EXECUTIVE BRIEFING SUMMARY
app.get('/api/dashboard/live-summary', async (req, res) => {
  try {
    let emailTotal = liveIngestedEmails.length;
    let pendingHuman = liveIngestedEmails.filter(e => e.status === 'needs_human').length;
    let invTotal = liveIngestedEmails.filter(e => e.category === 'invoice').length;

    try {
      const { data: dbEmails } = await supabase.from('email_inbox').select('status, category');
      if (dbEmails && dbEmails.length > 0) {
        emailTotal = dbEmails.length;
        pendingHuman = dbEmails.filter(e => e.status === 'needs_human').length;
        invTotal = dbEmails.filter(e => e.category === 'invoice').length;
      }
    } catch (e) {}

    res.json({
      emailCount: emailTotal,
      pendingHuman: pendingHuman,
      invoicesCount: invTotal,
      activeAgents: 20,
      systemStatus: isNvidia ? 'NVIDIA H100 GPU Accelerated' : 'OpenAI Active',
      recentLogs: []
    });

  } catch (error) {
    console.error('Error fetching live summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// 5. EMAIL TRIAGE & LIVE INBOX ENDPOINTS (NO MOCK FALLBACKS)
app.post('/api/email/triage', async (req, res) => {
  try {
    const { recipient_email, sender_email, sender_name, subject, body_text, has_attachments, attachment_names } = req.body;
    if (!sender_email || !subject || !body_text) {
      return res.status(400).json({ error: 'sender_email, subject, and body_text are required' });
    }

    const result = await processIncomingEmail({
      recipient_email,
      sender_email,
      sender_name,
      subject,
      body_text,
      has_attachments: !!has_attachments,
      attachment_names: attachment_names || []
    });

    res.json(result);
  } catch (error) {
    console.error('Error in email triage endpoint:', error);
    res.status(500).json({ error: 'Internal server error during email triage' });
  }
});

app.post('/api/email/sync-now', async (req, res) => {
  try {
    await syncAllAcademyInboxes();
    res.json({ message: 'Sync triggered successfully across all 5 accounts' });
  } catch (error) {
    console.error('Error syncing inboxes:', error);
    res.status(500).json({ error: 'Failed to sync inboxes' });
  }
});

app.get('/api/email/inbox', async (req, res) => {
  try {
    // Check Supabase first
    const { data: dbEmails, error } = await supabase
      .from('email_inbox')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && dbEmails && dbEmails.length > 0) {
      return res.json({ emails: dbEmails });
    }

    // Return live ingested memory store (no mock data!)
    res.json({ emails: liveIngestedEmails });
  } catch (error) {
    res.json({ emails: liveIngestedEmails });
  }
});

const PORT = process.env.PORT || 3001;

// Vercel's Express service imports the app. Only open a socket for local runs.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Master CEO & Agent Network Engine running on port ${PORT}`);
    if (isNvidia) {
      console.log(`🚀 Using NVIDIA NIM API (${defaultModelName}) - Costs Reduced!`);
    }

    syncAllAcademyInboxes().catch(e => console.error('IMAP startup check notice:', e.message));
  });
}

export default app;
