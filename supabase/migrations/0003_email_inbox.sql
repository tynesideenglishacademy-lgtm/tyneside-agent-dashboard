-- 0003_email_inbox.sql
-- Table for storing ingested emails, Receptionist AI classifications, and extracted invoice data

CREATE TABLE IF NOT EXISTS email_inbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id VARCHAR(255) UNIQUE,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    subject TEXT,
    body_text TEXT,
    has_attachments BOOLEAN DEFAULT FALSE,
    attachment_data JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(100) DEFAULT 'inquiry', -- inquiry, invoice, absence, complaint, lead, spam
    ai_classification JSONB DEFAULT '{}'::jsonb, -- AI reasoning, proposed reply, confidence
    extracted_invoice JSONB DEFAULT '{}'::jsonb, -- supplier, invoice_num, amount, tax, due_date
    status VARCHAR(100) DEFAULT 'pending_triage', -- pending_triage, draft_ready, processed, inserted_to_crm, needs_human
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON email_inbox FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write access for authenticated users" ON email_inbox FOR ALL TO authenticated USING (true);
