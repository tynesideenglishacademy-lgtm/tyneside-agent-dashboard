-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE agent_division AS ENUM ('orchestrator', 'front_desk', 'academic', 'finance_ops', 'marketing');
CREATE TYPE agent_status AS ENUM ('active', 'paused', 'maintenance');
CREATE TYPE task_status AS ENUM ('pending', 'running', 'completed', 'failed', 'awaiting_human');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'modified');

-- 1. agent_registry
-- The directory of all active agents in the Tyneside Ecosystem
CREATE TABLE agent_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    division agent_division NOT NULL,
    system_prompt TEXT NOT NULL,
    model_preference VARCHAR(100) DEFAULT 'gpt-4o',
    status agent_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. agent_tasks
-- The universal queue where the Master CEO delegates work
CREATE TABLE agent_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assigned_agent_id UUID REFERENCES agent_registry(id) ON DELETE CASCADE,
    created_by UUID, -- Could be a user ID or another agent ID
    title VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status task_status DEFAULT 'pending',
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. human_approvals
-- Safety net for high-stakes actions (e.g. Debt Collector, Legal emails)
CREATE TABLE human_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE NOT NULL,
    proposed_action TEXT NOT NULL,
    status approval_status DEFAULT 'pending',
    human_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 4. agent_audit_logs
-- Chronological memory of the entire academy's AI operations
CREATE TABLE agent_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agent_registry(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic Row Level Security (RLS) Setup
ALTER TABLE agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_audit_logs ENABLE ROW LEVEL SECURITY;

-- For now, allow authenticated users to view and modify everything.
CREATE POLICY "Enable read access for authenticated users" ON agent_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write access for authenticated users" ON agent_registry FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON agent_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write access for authenticated users" ON agent_tasks FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON human_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write access for authenticated users" ON human_approvals FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON agent_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON agent_audit_logs FOR INSERT TO authenticated WITH CHECK (true);
