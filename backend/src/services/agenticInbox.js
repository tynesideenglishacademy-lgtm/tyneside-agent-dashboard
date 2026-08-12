import { supabase } from '../config/db.js';
import { openai, defaultModelName } from '../config/llm.js';

export async function processAgenticInbox(emailData) {
  try {
    console.log(`[Agentic Inbox] Triaging email from: ${emailData.sender_email}`);

    const prompt = `You are the Receptionist (Email Triage) Agent for Tyneside English Academy.
Review this incoming email and categorize it. Then, draft a polite, professional reply.

Email from: ${emailData.sender_name} <${emailData.sender_email}>
Subject: ${emailData.subject}
Body:
${emailData.body_text}

Respond in JSON format:
{
  "category": "sales|support|billing|absence|other",
  "urgency": "low|medium|high",
  "draft_reply": "Your drafted response here",
  "requires_ceo": boolean
}`;

    let triageResult = {
      category: 'other',
      urgency: 'medium',
      draft_reply: 'Thank you for contacting Tyneside English Academy. We will get back to you shortly.',
      requires_ceo: true
    };

    try {
      const completion = await openai.chat.completions.create({
        model: defaultModelName,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      triageResult = JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      console.error('LLM Triage failed, using fallback:', e);
    }

    // Save the email to the inbox
    const { data: savedEmail, error: emailErr } = await supabase
      .from('email_inbox')
      .insert({
        recipient_email: emailData.recipient_email || 'info@tyneside.es',
        sender_email: emailData.sender_email,
        sender_name: emailData.sender_name || emailData.sender_email,
        subject: emailData.subject,
        body_text: emailData.body_text,
        category: triageResult.category,
        status: triageResult.requires_ceo ? 'needs_human' : 'read'
      })
      .select()
      .single();

    if (emailErr) throw emailErr;

    // Send the draft reply to the Shepherd Sandbox for CEO approval
    if (triageResult.draft_reply) {
      const { data: agent } = await supabase.from('agent_registry').select('id, name').ilike('name', '%Receptionist%').single();
      
      await supabase.from('action_sandbox_logs').insert({
        agent_id: agent?.id || null,
        agent_name: agent?.name || 'Receptionist (Email Triage)',
        action_type: 'EMAIL_REPLY',
        payload: {
          to: emailData.sender_email,
          subject: `Re: ${emailData.subject}`,
          body: triageResult.draft_reply,
          original_email_id: savedEmail.id
        },
        status: 'pending'
      });
    }

    return triageResult;
  } catch (error) {
    console.error('Agentic Inbox Error:', error);
    throw error;
  }
}
