import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import CeoChat from './pages/CeoChat';
import Connections from './pages/Connections';
import AgentWorkspace from './pages/AgentWorkspace';
import SocialDashboard from './pages/SocialDashboard';
import BlogDashboard from './pages/BlogDashboard';
import EmailTriage from './pages/EmailTriage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="ceo-chat" element={<CeoChat />} />
          <Route path="connections" element={<Connections />} />
          <Route path="email-triage" element={<EmailTriage />} />
          <Route path="social-studio" element={<SocialDashboard />} />
          <Route path="blog-studio" element={<BlogDashboard />} />
          <Route path="agent/:agentId" element={<AgentWorkspace />} />
          <Route path="*" element={
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ color: 'var(--text-secondary)' }}>Module Under Construction</h2>
              <p>The Master CEO Agent is currently orchestrating this workspace.</p>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
