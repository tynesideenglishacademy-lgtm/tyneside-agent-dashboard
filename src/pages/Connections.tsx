import React, { useState } from 'react';
import { 
  Network, Mail, MessageSquare, CreditCard, Share2, Search, 
  CheckCircle2, AlertCircle, RefreshCw, ShieldCheck
} from 'lucide-react';
import './Connections.css';

interface Connection {
  id: string;
  name: string;
  category: 'Email' | 'Social & Ads' | 'Messaging' | 'CRM & Payments' | 'Government Scrapers';
  status: 'connected' | 'pending' | 'disconnected';
  description: string;
  icon: string;
  lastSync?: string;
}

const Connections: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const [connections, setConnections] = useState<Connection[]>([
    { id: '1', name: 'Tyneside Supabase DB', category: 'CRM & Payments', status: 'connected', description: 'Primary database sync for students (TEA-XXX), timetables (T2627), and billing.', icon: 'database', lastSync: '2 minutes ago' },
    { id: '2', name: 'WhatsApp Business API (Twilio)', category: 'Messaging', status: 'connected', description: 'Direct messaging integration for instant absence reporting & parent FAQs.', icon: 'message', lastSync: '5 minutes ago' },
    { id: '3', name: 'Gmail / Outlook Triage API', category: 'Email', status: 'connected', description: 'Monitors info@tyneside for automatic email classification & reception drafts.', icon: 'mail', lastSync: '10 minutes ago' },
    { id: '4', name: 'Meta Graph API (Instagram & FB)', category: 'Social & Ads', status: 'connected', description: 'Publishing & Lead Ads capture for Instagram & Facebook campaigns.', icon: 'share', lastSync: '1 hour ago' },
    { id: '5', name: 'Stripe & GoCardless Payments', category: 'CRM & Payments', status: 'connected', description: 'SEPA bounce notifications & automated payment link generation for Debt Collector.', icon: 'credit', lastSync: '30 minutes ago' },
    { id: '6', name: 'BOE & Murcia Government Scraper', category: 'Government Scrapers', status: 'connected', description: 'RSS & scraper feeds targeting Fundae and Murcia educational grant alerts.', icon: 'search', lastSync: '3 hours ago' },
    { id: '7', name: 'TikTok Content API', category: 'Social & Ads', status: 'pending', description: 'Short-form video publishing for educational Cambridge exam Reels/TikToks.', icon: 'share' },
    { id: '8', name: 'Holded / Xero Accounting', category: 'CRM & Payments', status: 'disconnected', description: 'Spanish invoice reconciliation & tax report generation for Accountant agent.', icon: 'credit' },
    { id: '9', name: 'Google Business Profile API', category: 'Social & Ads', status: 'connected', description: 'Google Maps review monitoring and automated response drafting.', icon: 'share', lastSync: '20 minutes ago' }
  ]);

  const toggleConnection = (id: string) => {
    setConnections(prev => prev.map(conn => {
      if (conn.id === id) {
        const nextStatus = conn.status === 'connected' ? 'disconnected' : 'connected';
        return { ...conn, status: nextStatus, lastSync: nextStatus === 'connected' ? 'Just now' : undefined };
      }
      return conn;
    }));
  };

  const categories = ['All', 'Messaging', 'Email', 'Social & Ads', 'CRM & Payments', 'Government Scrapers'];

  const filteredConnections = activeCategory === 'All' 
    ? connections 
    : connections.filter(c => c.category === activeCategory);

  return (
    <div className="connections-container animate-fade-in">
      {/* Header */}
      <div className="connections-header glass-panel">
        <div className="header-info">
          <Network size={32} className="text-accent" />
          <div>
            <h1>Connections & Integration Hub</h1>
            <p className="subtitle">Connect external APIs, messaging channels, payment gateways, and scrapers to your AI agent ecosystem.</p>
          </div>
        </div>

        <div className="security-badge glass-panel">
          <ShieldCheck size={18} className="text-success" />
          <span>Encrypted Credentials & Supabase RLS Active</span>
        </div>
      </div>

      {/* Category Filters */}
      <div className="filter-bar">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Connections */}
      <div className="connections-grid">
        {filteredConnections.map(conn => (
          <div key={conn.id} className="connection-card glass-panel">
            <div className="conn-header">
              <div className="conn-title-flex">
                {conn.category === 'Messaging' && <MessageSquare size={22} className="text-accent" />}
                {conn.category === 'Email' && <Mail size={22} className="text-accent" />}
                {conn.category === 'Social & Ads' && <Share2 size={22} className="text-accent" />}
                {conn.category === 'CRM & Payments' && <CreditCard size={22} className="text-accent" />}
                {conn.category === 'Government Scrapers' && <Search size={22} className="text-accent" />}
                <div>
                  <h3 className="conn-name">{conn.name}</h3>
                  <span className="conn-category">{conn.category}</span>
                </div>
              </div>

              <span className={`status-pill status-${conn.status}`}>
                {conn.status === 'connected' && <CheckCircle2 size={12} />}
                {conn.status === 'pending' && <RefreshCw size={12} className="spin" />}
                {conn.status === 'disconnected' && <AlertCircle size={12} />}
                {conn.status}
              </span>
            </div>

            <p className="conn-desc">{conn.description}</p>

            <div className="conn-footer">
              <span className="conn-sync">
                {conn.lastSync ? `Synced: ${conn.lastSync}` : 'Not connected'}
              </span>

              <button 
                className={`btn btn-sm ${conn.status === 'connected' ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => toggleConnection(conn.id)}
              >
                {conn.status === 'connected' ? 'Disconnect' : 'Connect API'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Connections;
