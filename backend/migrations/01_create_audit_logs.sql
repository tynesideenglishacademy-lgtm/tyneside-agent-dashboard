-- Migration: 01_create_audit_logs.sql
-- Description: Create audit_logs table for tracking user & AI agent actions across Tyneside CRM and Dashboard ecosystem

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agent_name VARCHAR(100) DEFAULT 'SYSTEM',
    action VARCHAR(100) NOT NULL, -- e.g., 'USER_DELETED', 'PAYMENT_PROCESSED', 'INVOICE_RECONCILED', 'EMAIL_TRIAGED'
    resource_type VARCHAR(100) NOT NULL, -- e.g., 'invoices', 'crm_users', 'emails'
    resource_id TEXT,
    status VARCHAR(50) DEFAULT 'EXECUTED' NOT NULL, -- 'EXECUTED', 'PENDING_APPROVAL', 'REVERTED'
    ip_address VARCHAR(45),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view audit logs
CREATE POLICY "Allow authenticated read audit_logs" ON audit_logs
    FOR SELECT TO authenticated USING (true);

-- Allow backend service role & authenticated users to insert audit logs
CREATE POLICY "Allow authenticated insert audit_logs" ON audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Comment for schema documentation
COMMENT ON TABLE audit_logs IS 'Audit logging table for Tyneside CRM and Agent Dashboard actions & safety tracking';
