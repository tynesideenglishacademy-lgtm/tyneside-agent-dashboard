import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, MessageSquare, Network, Settings,
  Inbox, MessageCircle, HeartPulse, Magnet,
  GraduationCap, Award, Calendar,
  Calculator, AlertTriangle, TrendingUp, Briefcase, Search, Package, Book,
  Target, Share2, Film, Edit3, Star, Brain
} from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2 className="text-gradient">Tyneside<br/>Dashboard</h2>
      </div>
      
      <div className="sidebar-scrollable">
        <nav className="sidebar-nav">
          <div className="nav-section-title">👑 The Orchestrator</div>
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Home size={18} />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/ceo-chat" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MessageSquare size={18} />
            <span>Master CEO Agent</span>
          </NavLink>
          <NavLink to="/connections" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Network size={18} />
            <span>Connections Hub</span>
          </NavLink>

          <div className="nav-section-title">🎨 Dedicated Studios</div>
          <NavLink to="/email-triage" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Inbox size={18} />
            <span>Email & Invoice Triage</span>
          </NavLink>
          <NavLink to="/social-studio" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Brain size={18} />
            <span>Social & Brand Brain</span>
          </NavLink>
          <NavLink to="/blog-studio" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Edit3 size={18} />
            <span>Blog & SEO Studio</span>
          </NavLink>

          <div className="nav-section-title">🛎️ Front Desk & CS</div>
          <div className="nav-group">
            <NavLink to="/agent/receptionist" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Inbox size={16} />
              <span>Receptionist (Email)</span>
            </NavLink>
            <NavLink to="/agent/whatsapp" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <MessageCircle size={16} />
              <span>WhatsApp Concierge</span>
            </NavLink>
            <NavLink to="/agent/retention" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <HeartPulse size={16} />
              <span>Churn Predictor</span>
            </NavLink>
            <NavLink to="/agent/lead-gen" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Magnet size={16} />
              <span>Lead Gen Prospector</span>
            </NavLink>
          </div>

          <div className="nav-section-title">📚 Academic & Delivery</div>
          <div className="nav-group">
            <NavLink to="/agent/lesson-architect" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <GraduationCap size={16} />
              <span>Lesson Architect</span>
            </NavLink>
            <NavLink to="/agent/examiner" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Award size={16} />
              <span>Cambridge Examiner</span>
            </NavLink>
            <NavLink to="/agent/scheduler" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Calendar size={16} />
              <span>Substitute Scheduler</span>
            </NavLink>
          </div>

          <div className="nav-section-title">💰 Finance, Legal & Ops</div>
          <div className="nav-group">
            <NavLink to="/agent/accountant" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Calculator size={16} />
              <span>Accountant</span>
            </NavLink>
            <NavLink to="/agent/debt-collector" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <AlertTriangle size={16} />
              <span>Debt Collector</span>
            </NavLink>
            <NavLink to="/agent/advisor" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <TrendingUp size={16} />
              <span>Financial Advisor</span>
            </NavLink>
            <NavLink to="/agent/legal" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Briefcase size={16} />
              <span>Legal Counsel</span>
            </NavLink>
            <NavLink to="/agent/fundae" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Search size={16} />
              <span>Fundae / BOE Scout</span>
            </NavLink>
            <NavLink to="/agent/procurement" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Package size={16} />
              <span>Procurement Officer</span>
            </NavLink>
            <NavLink to="/agent/docs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Book size={16} />
              <span>Internal Documentarian</span>
            </NavLink>
          </div>

          <div className="nav-section-title">📢 Marketing & Growth</div>
          <div className="nav-group">
            <NavLink to="/agent/marketing" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Target size={16} />
              <span>Marketing Strategist</span>
            </NavLink>
            <NavLink to="/agent/social" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Share2 size={16} />
              <span>Social Media Agent</span>
            </NavLink>
            <NavLink to="/agent/video" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Film size={16} />
              <span>Video Generator</span>
            </NavLink>
            <NavLink to="/agent/blog" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Edit3 size={16} />
              <span>Blog Writer (SEO)</span>
            </NavLink>
            <NavLink to="/agent/reputation" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Star size={16} />
              <span>Local SEO & Rep</span>
            </NavLink>
          </div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/settings" className="nav-link">
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
