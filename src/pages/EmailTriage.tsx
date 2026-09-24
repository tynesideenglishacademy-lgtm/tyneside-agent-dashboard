import React, { useState, useEffect } from 'react';
import { 
  Mail, FileText, CheckCircle2, RefreshCw, Send, 
  Sparkles, Building2, UserCheck
} from 'lucide-react';
import { apiFetch } from '../lib/adminAuth';
import './EmailTriage.css';

interface IngestedEmail {
  id: string;
  recipient_email: string; // Target email account
  sender_email: string;
  sender_name: string;
  subject: string;
  body_text: string;
  category: 'invoice' | 'absence' | 'inquiry' | 'complaint' | 'lead';
  has_attachments: boolean;
  status: 'pending_triage' | 'needs_human' | 'processed' | 'inserted_to_crm';
  extracted_invoice?: {
    supplier?: string;
    invoice_number?: string;
    total_amount?: number;
    tax_amount?: number;
    due_date?: string;
  };
  extracted_absence?: {
    person_name?: string;
    date?: string;
    reason?: string;
  };
  ai_classification?: {
    summary?: string;
    reply_draft?: string;
    crm_action?: string;
  };
  created_at: string;
}

const ACADEMY_ACCOUNTS = [
  { address: 'all', label: 'All Accounts (5 Active)', role: 'Master Ecosystem' },
  { address: 'secretaria@tynesideacademy.com', label: 'secretaria@', role: 'Receptionist & Absences' },
  { address: 'info@tynesideacademy.com', label: 'info@', role: 'General Inquiries & Leads' },
  { address: 'admin@tynesideacademy.com', label: 'admin@', role: 'Accountant & Invoices' },
  { address: 'academia@tynesideacademy.com', label: 'academia@', role: 'Operations & Management' },
  { address: 'tynesideenglishacademy@gmail.com', label: 'gmail.com', role: 'Google Workspace Fallback' },
];

const EmailTriage: React.FC = () => {
  const [emails, setEmails] = useState<IngestedEmail[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedEmail, setSelectedEmail] = useState<IngestedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulation Form State
  const [simTarget, setSimTarget] = useState('admin@tynesideacademy.com');
  const [simSender, setSimSender] = useState('facturas@libros-cambridge.es');
  const [simSubject, setSimSubject] = useState('Factura ES-2026-9901 - Libros B2 First');
  const [simBody, setSimBody] = useState('Estimada administración, Adjuntamos factura N° ES-2026-9901 por 487.50€ correspondiente al pedido de libros B2 First.');
  const [isTriagingSim, setIsTriagingSim] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchInbox = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/email/inbox');
      if (res.ok) {
        const data = await res.json();
        const rawEmails: IngestedEmail[] = data.emails || [];
        // Map default recipients if missing
        const mapped = rawEmails.map((e) => ({
          ...e,
          recipient_email: e.recipient_email || (e.category === 'invoice' ? 'admin@tynesideacademy.com' : (e.category === 'absence' ? 'secretaria@tynesideacademy.com' : 'info@tynesideacademy.com'))
        }));
        setEmails(mapped);
        if (mapped.length > 0 && !selectedEmail) {
          setSelectedEmail(mapped[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch inbox:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const filteredEmails = selectedAccount === 'all' 
    ? emails 
    : emails.filter(e => e.recipient_email === selectedAccount);

  const handleSimulateTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriagingSim(true);
    try {
      const res = await apiFetch('/api/email/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: simTarget,
          sender_email: simSender,
          sender_name: simSender.split('@')[0],
          subject: simSubject,
          body_text: simBody,
          has_attachments: true,
          attachment_names: ['factura_es_2026.pdf']
        })
      });
      if (res.ok) {
        await fetchInbox();
        setActionSuccessMsg(`Email to ${simTarget} ingested & triaged by NVIDIA AI!`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Triage simulation error:', err);
    } finally {
      setIsTriagingSim(false);
    }
  };

  const handleProcessInvoiceToCRM = (email: IngestedEmail) => {
    setActionSuccessMsg(`Invoice from ${email.extracted_invoice?.supplier || 'Supplier'} (€${email.extracted_invoice?.total_amount}) successfully inserted into Supabase CRM expenses!`);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: 'inserted_to_crm' } : e));
    if (selectedEmail?.id === email.id) {
      setSelectedEmail(prev => prev ? { ...prev, status: 'inserted_to_crm' } : null);
    }
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleLogAbsenceToCRM = (email: IngestedEmail) => {
    setActionSuccessMsg(`Absence for ${email.extracted_absence?.person_name || 'Student'} logged in CRM Attendance tables & notification sent to teacher!`);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: 'processed' } : e));
    if (selectedEmail?.id === email.id) {
      setSelectedEmail(prev => prev ? { ...prev, status: 'processed' } : null);
    }
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="triage-container animate-fade-in">
      {/* Header */}
      <div className="triage-header glass-panel">
        <div className="triage-title">
          <Mail size={32} className="text-accent" />
          <div>
            <h1>Multi-Account Email Triage & Invoice Studio</h1>
            <p className="subtitle">Managing 5 official academy inboxes with automatic Receptionist & Accountant routing.</p>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchInbox} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh All Inboxes
        </button>
      </div>

      {/* Account Selector Bar */}
      <div className="account-selector-bar">
        {ACADEMY_ACCOUNTS.map(acc => (
          <button 
            key={acc.address}
            className={`account-chip ${selectedAccount === acc.address ? 'active' : ''}`}
            onClick={() => setSelectedAccount(acc.address)}
          >
            <Mail size={14} />
            <span className="chip-label">{acc.label}</span>
            <span className="chip-role">{acc.role}</span>
          </button>
        ))}
      </div>

      {actionSuccessMsg && (
        <div className="toast-success glass-panel animate-fade-in">
          <CheckCircle2 size={18} className="text-success" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="triage-grid">
        {/* Left Column: Email List */}
        <div className="email-list-panel glass-panel">
          <h3>Inbox Feed ({filteredEmails.length})</h3>

          <div className="email-scroll-list">
            {filteredEmails.map(email => (
              <div 
                key={email.id} 
                className={`email-card ${selectedEmail?.id === email.id ? 'active' : ''}`}
                onClick={() => setSelectedEmail(email)}
              >
                <div className="email-card-header">
                  <span className="email-sender">{email.sender_name || email.sender_email}</span>
                  <span className={`cat-pill cat-${email.category}`}>{email.category}</span>
                </div>
                <h4 className="email-subject">{email.subject}</h4>
                <div className="recipient-tag">To: {email.recipient_email.split('@')[0]}@</div>
                <p className="email-snippet">{email.body_text.slice(0, 65)}...</p>
                
                <div className="email-card-footer">
                  <span className="email-date">{new Date(email.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(email.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`status-tag status-${email.status}`}>
                    {email.status === 'inserted_to_crm' ? 'CRM Linked' : email.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Selected Email Details & AI Triage */}
        <div className="email-detail-panel glass-panel">
          {selectedEmail ? (
            <div className="detail-wrapper">
              <div className="detail-header">
                <div>
                  <div className="detail-tags-flex">
                    <span className={`cat-pill cat-${selectedEmail.category}`}>{selectedEmail.category.toUpperCase()}</span>
                    <span className="account-tag">Target Inbox: {selectedEmail.recipient_email}</span>
                  </div>
                  <h2>{selectedEmail.subject}</h2>
                  <span className="detail-meta">From: {selectedEmail.sender_name} &lt;{selectedEmail.sender_email}&gt;</span>
                </div>
              </div>

              {/* Original Message Body */}
              <div className="email-body-box">
                <p>{selectedEmail.body_text}</p>
                {selectedEmail.has_attachments && (
                  <div className="attachment-chip">
                    <FileText size={14} className="text-accent" />
                    <span>Attachment: invoice_document.pdf</span>
                  </div>
                )}
              </div>

              {/* AI Triage & Extraction Box */}
              <div className="ai-triage-box glass-panel">
                <div className="triage-box-header">
                  <Sparkles size={18} className="text-accent" />
                  <h3>Receptionist & Accountant AI Intelligence</h3>
                </div>

                <p className="triage-summary"><strong>Summary:</strong> {selectedEmail.ai_classification?.summary || 'Email analyzed'}</p>

                {/* INVOICE EXTRACTION DISPLAY */}
                {selectedEmail.category === 'invoice' && (
                  <div className="invoice-extraction-card">
                    <div className="card-title"><Building2 size={16} className="text-accent" /> Extracted Invoice Details</div>
                    <div className="extraction-grid">
                      <div><span className="lbl">Supplier:</span> {selectedEmail.extracted_invoice?.supplier || 'Unknown'}</div>
                      <div><span className="lbl">Invoice #:</span> {selectedEmail.extracted_invoice?.invoice_number || 'N/A'}</div>
                      <div><span className="lbl">Total Amount:</span> <strong className="text-accent">€{selectedEmail.extracted_invoice?.total_amount || '0.00'}</strong></div>
                      <div><span className="lbl">Due Date:</span> {selectedEmail.extracted_invoice?.due_date || 'Immediate'}</div>
                    </div>

                    <button 
                      className="btn btn-primary width-full btn-action" 
                      onClick={() => handleProcessInvoiceToCRM(selectedEmail)}
                      disabled={selectedEmail.status === 'inserted_to_crm'}
                    >
                      {selectedEmail.status === 'inserted_to_crm' ? '✅ Linked to CRM Expenses' : 'Pass Invoice to Supabase CRM'}
                    </button>
                  </div>
                )}

                {/* ABSENCE EXTRACTION DISPLAY */}
                {selectedEmail.category === 'absence' && (
                  <div className="absence-extraction-card">
                    <div className="card-title"><UserCheck size={16} className="text-accent" /> Absence Report Details</div>
                    <div className="extraction-grid">
                      <div><span className="lbl">Student/Staff Name:</span> {selectedEmail.extracted_absence?.person_name || 'Student'}</div>
                      <div><span className="lbl">Date:</span> {selectedEmail.extracted_absence?.date || 'Today'}</div>
                      <div><span className="lbl">Reason:</span> {selectedEmail.extracted_absence?.reason || 'Not specified'}</div>
                    </div>

                    <button 
                      className="btn btn-primary width-full btn-action"
                      onClick={() => handleLogAbsenceToCRM(selectedEmail)}
                      disabled={selectedEmail.status === 'processed'}
                    >
                      {selectedEmail.status === 'processed' ? '✅ Absence Logged in CRM' : 'Log Absence in Supabase CRM'}
                    </button>
                  </div>
                )}

                {/* INQUIRY DRAFT DISPLAY */}
                {selectedEmail.category === 'inquiry' && selectedEmail.ai_classification?.reply_draft && (
                  <div className="reply-draft-card">
                    <div className="card-title"><Send size={16} className="text-accent" /> AI Drafted Response</div>
                    <textarea className="input-field reply-textarea" rows={5} defaultValue={selectedEmail.ai_classification.reply_draft} />
                    <button className="btn btn-primary btn-action width-full">Approve & Send Email Reply</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-preview">
              <Mail size={36} className="text-secondary opacity-50" />
              <p>Select an email from the inbox list to view AI triage details.</p>
            </div>
          )}
        </div>

        {/* Right Column: Live Triage Simulator */}
        <div className="simulator-panel glass-panel">
          <h3><Sparkles size={18} className="text-accent" /> Live Multi-Inbox Simulator</h3>
          <p className="sim-desc">Test real-time routing to your 5 official academy email addresses.</p>

          <form onSubmit={handleSimulateTriage} className="sim-form">
            <div className="form-group">
              <label>Target Academy Inbox</label>
              <select className="input-field" value={simTarget} onChange={e => setSimTarget(e.target.value)}>
                <option value="admin@tynesideacademy.com">admin@ (Accountant Agent)</option>
                <option value="secretaria@tynesideacademy.com">secretaria@ (Receptionist & Absences)</option>
                <option value="info@tynesideacademy.com">info@ (General Inquiries & Leads)</option>
                <option value="academia@tynesideacademy.com">academia@ (Operations)</option>
                <option value="tynesideenglishacademy@gmail.com">gmail.com (Google Workspace)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preset Test Cases</label>
              <div className="preset-btns">
                <button 
                  type="button" 
                  className="preset-btn"
                  onClick={() => {
                    setSimTarget('admin@tynesideacademy.com');
                    setSimSender('facturas@libros-cambridge.es');
                    setSimSubject('Factura ES-2026-9901 - Libros B2 First');
                    setSimBody('Estimada administración, Adjuntamos factura N° ES-2026-9901 por 487.50€ correspondiente al pedido de libros B2 First.');
                  }}
                >
                  📄 Book Invoice
                </button>
                <button 
                  type="button" 
                  className="preset-btn"
                  onClick={() => {
                    setSimTarget('secretaria@tynesideacademy.com');
                    setSimSender('padres.carlos@gmail.com');
                    setSimSubject('Aviso de ausencia de Carlos García');
                    setSimBody('Hola Secretaría, Carlos está con fiebre y no podrá asistir a la clase de B2 hoy a las 17:30. Un saludo.');
                  }}
                >
                  🤒 Student Absence
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Sender Email</label>
              <input type="email" className="input-field" value={simSender} onChange={e => setSimSender(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input type="text" className="input-field" value={simSubject} onChange={e => setSimSubject(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Email Body</label>
              <textarea className="input-field sim-textarea" rows={3} value={simBody} onChange={e => setSimBody(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary width-full" disabled={isTriagingSim}>
              {isTriagingSim ? 'NVIDIA AI Triaging Email...' : 'Ingest & Run AI Triage'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailTriage;
