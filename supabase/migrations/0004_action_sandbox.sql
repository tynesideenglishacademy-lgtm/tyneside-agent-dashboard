-- Shepherd (Action Sandbox) Migration
-- This table logs pending actions from agents that require CEO approval before execution.

CREATE TABLE IF NOT EXISTS action_sandbox_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agent_registry(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  action_type TEXT NOT NULL, -- e.g., 'EMAIL_PARENT', 'SOCIAL_POST', 'ISSUE_ABONO'
  payload JSONB NOT NULL,    -- Detailed payload of the intended action
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rolled_back', 'failed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE action_sandbox_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write access to authenticated users (admin/CEO)
CREATE POLICY "Allow all authenticated users full access to action sandbox"
  ON action_sandbox_logs
  FOR ALL
  TO authenticated
  USING (true);
