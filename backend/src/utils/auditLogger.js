import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('your-project')) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Logs an audit event to the Supabase audit_logs table asynchronously.
 * 
 * @param {Object} options
 * @param {Object} [options.req] - Express request object (optional)
 * @param {string} [options.userId] - ID of the user performing the action
 * @param {string} [options.agentName] - Name of the AI agent if applicable (e.g. 'CEO_ASSISTANT', 'INVOICE_RECONCILER')
 * @param {string} options.action - Action identifier (e.g., 'USER_DELETED', 'INVOICE_RECONCILED')
 * @param {string} options.resourceType - Resource identifier (e.g., 'invoices', 'crm_users', 'emails')
 * @param {string} [options.resourceId] - Specific ID of the resource
 * @param {string} [options.status='EXECUTED'] - Action status ('EXECUTED', 'PENDING_APPROVAL', 'REVERTED')
 * @param {Object} [options.metadata={}] - Additional key-value metadata
 */
export async function logAuditEvent({
  req = null,
  userId = null,
  agentName = 'SYSTEM',
  action,
  resourceType,
  resourceId = null,
  status = 'EXECUTED',
  metadata = {}
}) {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null) : null;
    const finalUserId = userId || (req?.user?.id || null);

    const logEntry = {
      user_id: finalUserId,
      agent_name: agentName,
      action: action,
      resource_type: resourceType,
      resource_id: resourceId ? String(resourceId) : null,
      status: status,
      ip_address: ipAddress,
      metadata: metadata,
      created_at: new Date().toISOString()
    };

    console.log(`[AUDIT LOG] [${status}] ${agentName} -> ${action} on ${resourceType}:${resourceId || 'N/A'}`);

    if (supabase) {
      const { error } = await supabase.from('audit_logs').insert([logEntry]);
      if (error) {
        // Table might not exist yet or connection issue - gracefully log warning
        console.warn(`[AUDIT LOG WARNING] Could not insert to Supabase DB: ${error.message}`);
      }
    }
  } catch (err) {
    console.error(`[AUDIT LOG ERROR] Failed to record audit event:`, err.message);
  }
}
