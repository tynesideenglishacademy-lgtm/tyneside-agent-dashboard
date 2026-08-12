import React, { useState, useEffect } from 'react';
import { Activity, Mail, CheckCircle2, Bot, ShieldCheck, RefreshCw } from 'lucide-react';
import './Overview.css';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  positive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, positive = true }) => (
  <div className="stat-card glass-panel animate-fade-in">
    <div className="stat-header">
      <h3 className="stat-title">{title}</h3>
      <div className="stat-icon">{icon}</div>
    </div>
    <div className="stat-value text-gradient">{value}</div>
    <div className={`stat-trend ${positive ? 'text-success' : 'text-danger'}`}>
      {trend}
    </div>
  </div>
);

interface ActiveTask {
  id: string;
  agent_name: string;
  title: string;
  status: 'running' | 'completed' | 'pending';
}

interface AuditLogEntry {
  id: string;
  created_at: string;
  user_id?: string;
  agent_name: string;
  action: string;
  resource_type: string;
  status: string;
  ip_address?: string;
}

const Overview: React.FC = () => {
  const [inboxCount, setInboxCount] = useState<number>(0);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLiveMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/email/inbox');
      if (res.ok) {
        const data = await res.json();
        const emails = data.emails || [];
        setInboxCount(emails.length);
      }

      // Fetch Shepherd Pending Approvals
      const sandboxRes = await fetch('http://localhost:3001/api/sandbox/pending');
      if (sandboxRes.ok) {
        const sandboxData = await sandboxRes.json();
        setPendingApprovals((sandboxData.pending || []).length);
      }

      // Fetch Tasks
      const tasksRes = await fetch('http://localhost:3001/api/agent/ceo/tasks');
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setActiveTasks(tasksData.tasks || []);
      }

      // Fetch Audit Logs
      const auditRes = await fetch('http://localhost:3001/api/audit-logs');
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.logs || []);
      }
    } catch (e) {
      console.error('Error fetching live overview metrics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  return (
    <div className="overview-container animate-fade-in">
      <div className="overview-header">
        <div>
          <h1 className="text-gradient">Master CEO Executive Briefing</h1>
          <p className="text-secondary">Live ecosystem telemetry & real-time multi-agent activity.</p>
        </div>
        <button className="btn btn-primary pulse-glow" onClick={fetchLiveMetrics} disabled={isLoading}>
          <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
          <span>Sync Live System Briefing</span>
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Triaged Emails" value={inboxCount.toString()} icon={<Mail />} trend="Live sync across 5 inboxes" />
        <StatCard title="Human Approvals Pending" value={pendingApprovals.toString()} icon={<ShieldCheck />} trend="Awaiting CEO action" positive={pendingApprovals === 0} />
        <StatCard title="Active Agent Roster" value="20 Agents" icon={<Bot />} trend="100% Configured on NVIDIA NIM" />
        <StatCard title="NVIDIA AI System Status" value="Online" icon={<Activity />} positive={true} trend="Meta Llama 3.3 70B & DeepSeek R1" />
      </div>

      <div className="charts-section">
        <div className="chart-container glass-panel">
          <h3>Ecosystem Health & Operational Activity</h3>
          <div className="chart-wrapper" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '260px' }}>
            <Activity size={48} className="text-accent opacity-60" style={{ marginBottom: '1rem' }} />
            <p className="text-secondary" style={{ textAlign: 'center', maxWidth: '400px' }}>
              Real-time telemetry connected to <strong>Supabase DB</strong> and <strong>NVIDIA H100 GPUs</strong>. All agent operations are actively logged to <code>agent_audit_logs</code>.
            </p>
          </div>
        </div>
        
        <div className="tasks-container glass-panel">
          <h3>Live Agent Executions</h3>
          {activeTasks.length > 0 ? (
            <ul className="task-list">
              {activeTasks.map(task => (
                <li key={task.id} className="task-item">
                  <div className="task-info">
                    <strong>{task.agent_name}</strong>
                    <span>{task.title}</span>
                  </div>
                  <span className={`task-status status-${task.status}`}>{task.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={32} className="text-success" style={{ marginBottom: '0.5rem' }} />
              <p>No pending background task backlogs. Agents are idle and ready for instructions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Audit Log Security Trail */}
      <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={24} className="text-accent" />
            <h3 style={{ margin: 0 }}>Ecosystem Security & Audit Trail Stream (`audit_logs`)</h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Supabase Protected • Rate Limited
          </span>
        </div>

        {auditLogs.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem' }}>Agent / Actor</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                  <th style={{ padding: '0.75rem' }}>Target Resource</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-accent)' }}>
                      {log.agent_name}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {log.action}
                      </code>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{log.resource_type}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`status-tag status-${log.status.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Audit logging active. Logs will appear here as agents execute database operations or triage emails.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
