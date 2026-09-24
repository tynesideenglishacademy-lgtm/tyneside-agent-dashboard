import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Bot, Send, Settings, PlayCircle, Clock, CheckCircle2, 
  ShieldAlert, BookOpen, Save, RotateCcw, Sparkles, MessageSquare, ListTodo, Code2, Cpu
} from 'lucide-react';
import { apiFetch } from '../lib/adminAuth';
import { defaultPersonas, type AgentPersona } from '../data/agentPersonas';
import './AgentWorkspace.css';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed';
  created_at?: string;
}

interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  modelUsed?: string;
}

const AVAILABLE_NVIDIA_MODELS = [
  { id: 'meta/llama-3.3-70b-instruct', label: 'Meta Llama 3.3 70B (Default High Intelligence)' },
  { id: 'deepseek-ai/deepseek-r1', label: 'DeepSeek R1 (Deep Multi-Step Reasoning & Math)' },
  { id: 'meta/llama-3.1-8b-instruct', label: 'Meta Llama 3.1 8B (Sub-Second Ultra Fast)' },
  { id: 'meta/llama-3.1-405b-instruct', label: 'Meta Llama 3.1 405B (Massive Scale Intelligence)' },
  { id: 'mistralai/mistral-nemo-12b-instruct', label: 'Mistral NeMo 12B (Fast & Concise)' }
];

const AgentWorkspace: React.FC = () => {
  const { agentId = 'receptionist' } = useParams<{ agentId: string }>();
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'tasks'>('chat');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Load persona from default definitions or localStorage override
  const [persona, setPersona] = useState<AgentPersona>(() => {
    const key = agentId.toLowerCase();
    const stored = localStorage.getItem(`tyneside_agent_${key}`);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return defaultPersonas[key] || defaultPersonas['receptionist'];
  });

  const [systemPromptInput, setSystemPromptInput] = useState(persona.systemPrompt);
  const [selectedModel, setSelectedModel] = useState(persona.modelPreference || 'meta/llama-3.3-70b-instruct');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [liveTasks, setLiveTasks] = useState<Task[]>([]);

  // When route changes, update current persona & fetch tasks
  useEffect(() => {
    const key = agentId.toLowerCase();
    const stored = localStorage.getItem(`tyneside_agent_${key}`);
    let loadedPersona: AgentPersona;
    if (stored) {
      try { 
        loadedPersona = JSON.parse(stored); 
      } catch (e) {
        loadedPersona = defaultPersonas[key] || defaultPersonas['receptionist'];
      }
    } else {
      loadedPersona = defaultPersonas[key] || defaultPersonas['receptionist'];
    }
    setPersona(loadedPersona);
    setSystemPromptInput(loadedPersona.systemPrompt);
    setSelectedModel(loadedPersona.modelPreference || 'meta/llama-3.3-70b-instruct');

    // Initial Welcome Message
    setChatHistory([
      { sender: 'agent', text: `Hello! I am operating under my assigned operational guidelines for ${loadedPersona.division}. How can I assist you directly?` }
    ]);

    // Fetch Live Tasks for this Agent
    fetchTasks(key);
  }, [agentId]);

  const fetchTasks = async (key: string) => {
    try {
      const res = await apiFetch(`/api/agent/${key}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setLiveTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching live agent tasks:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setIsSending(true);

    try {
      const res = await apiFetch(`/api/agent/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { 
          sender: 'agent', 
          text: data.reply, 
          modelUsed: data.modelUsed 
        }]);
      } else {
        setChatHistory(prev => [...prev, { 
          sender: 'agent', 
          text: `[Offline Mode] Received directive: "${userText}". (Ensure backend server.js is running).` 
        }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        sender: 'agent', 
        text: `[Offline Mode] Received directive: "${userText}".` 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSavePrompt = () => {
    const updated = { 
      ...persona, 
      systemPrompt: systemPromptInput,
      modelPreference: selectedModel
    };
    setPersona(updated);
    localStorage.setItem(`tyneside_agent_${agentId.toLowerCase()}`, JSON.stringify(updated));
    setSaveNotification(`Agent configured to run on NVIDIA NIM (${selectedModel})!`);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleResetDefault = () => {
    const key = agentId.toLowerCase();
    const defaultP = defaultPersonas[key] || defaultPersonas['receptionist'];
    setPersona(defaultP);
    setSystemPromptInput(defaultP.systemPrompt);
    setSelectedModel(defaultP.modelPreference || 'meta/llama-3.3-70b-instruct');
    localStorage.removeItem(`tyneside_agent_${key}`);
    setSaveNotification('Reset to strict default rules and assigned NVIDIA model!');
    setTimeout(() => setSaveNotification(null), 3000);
  };

  return (
    <div className="workspace-container animate-fade-in">
      {/* Workspace Header */}
      <div className="workspace-header glass-panel">
        <div className="workspace-title">
          <Bot size={36} className="text-accent" />
          <div>
            <h1>{persona.name}</h1>
            <div className="workspace-tags">
              <span className="division-badge">{persona.division}</span>
              <span className="model-badge"><Cpu size={12} /> {selectedModel}</span>
              <span className="status-online">● NVIDIA GPU Accelerated</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="workspace-tabs-control">
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} /> Live Interaction
          </button>
          <button 
            className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <Code2 size={16} /> Persona & Prompt Editor
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <ListTodo size={16} /> Task Queue ({liveTasks.length})
          </button>
        </div>
      </div>

      {saveNotification && (
        <div className="save-toast glass-panel animate-fade-in">
          <Sparkles size={18} className="text-accent" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* TAB 1: LIVE INTERACTION & CHAT */}
      {activeTab === 'chat' && (
        <div className="workspace-content animate-fade-in">
          <div className="workspace-chat glass-panel">
            <h3>Direct Agent Channel</h3>
            <div className="chat-history-mini">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.sender === 'agent' ? 'message-agent' : 'message-user'} glass-panel`}>
                  <p>
                    <strong>{msg.sender === 'agent' ? persona.name : 'You'}:</strong> {msg.text}
                  </p>
                  {msg.modelUsed && <span className="model-used-tag">Model: {msg.modelUsed}</span>}
                </div>
              ))}
              {isSending && (
                <div className="chat-message message-agent glass-panel opacity-60">
                  <p><strong>{persona.name}:</strong> <em>Thinking with NVIDIA GPU...</em></p>
                </div>
              )}
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                className="input-field" 
                placeholder={`Send directive to ${persona.name}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isSending}
              />
              <button type="submit" className="btn btn-primary btn-icon" disabled={isSending}>
                <Send size={18} />
              </button>
            </form>
          </div>

          <div className="workspace-tasks glass-panel">
            <h3>Strict Operational Guardrails</h3>
            <div className="guardrails-summary-box">
              {persona.rules.map((rule, idx) => (
                <div key={idx} className="guardrail-item-mini">
                  <ShieldAlert size={16} className="text-warning" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONA & SYSTEM PROMPT EDITOR */}
      {activeTab === 'editor' && (
        <div className="persona-editor-grid animate-fade-in">
          {/* Left Column: Persona Details & Guardrails */}
          <div className="persona-details-panel glass-panel">
            <h3><BookOpen size={18} className="text-accent" /> Persona Specification</h3>
            
            <div className="persona-section">
              <label>Assigned NVIDIA NIM Model</label>
              <select 
                className="input-field model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {AVAILABLE_NVIDIA_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="persona-section">
              <label>Role & Identity</label>
              <p className="persona-text">{persona.role}</p>
            </div>

            <div className="persona-section">
              <label>Mission & Key Objective</label>
              <p className="persona-text">{persona.mission}</p>
            </div>

            <div className="persona-section">
              <label>Strict Operational Rules & Guardrails</label>
              <div className="rules-list">
                {persona.rules.map((rule, idx) => (
                  <div key={idx} className="rule-badge">
                    <ShieldAlert size={14} className="text-warning" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="persona-section">
              <label>Required JSON Output Format</label>
              <code className="code-block">{persona.outputFormat}</code>
            </div>
          </div>

          {/* Right Column: Editable System Prompt */}
          <div className="prompt-editor-panel glass-panel">
            <div className="prompt-editor-header">
              <h3><Settings size={18} className="text-accent" /> System Prompt Code</h3>
              <div className="prompt-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleResetDefault}>
                  <RotateCcw size={14} /> Reset Defaults
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSavePrompt}>
                  <Save size={14} /> Save Config
                </button>
              </div>
            </div>

            <p className="prompt-hint">
              This system prompt governs the NVIDIA LLM execution for this agent.
            </p>

            <textarea 
              className="prompt-textarea"
              value={systemPromptInput}
              onChange={(e) => setSystemPromptInput(e.target.value)}
              rows={16}
            />
          </div>
        </div>
      )}

      {/* TAB 3: TASK QUEUE */}
      {activeTab === 'tasks' && (
        <div className="workspace-tasks-full glass-panel animate-fade-in">
          <h3>Live Supabase Task Queue & Audit History for {persona.name}</h3>
          {liveTasks.length > 0 ? (
            <div className="task-list-full">
              {liveTasks.map(task => (
                <div key={task.id} className="task-item-mini">
                  <div className="task-icon">
                    {task.status === 'completed' && <CheckCircle2 size={18} className="text-success" />}
                    {task.status === 'running' && <PlayCircle size={18} className="text-accent" />}
                    {task.status === 'pending' && <Clock size={18} className="text-secondary" />}
                  </div>
                  <div className="task-details-mini">
                    <span className="task-title-mini">{task.title}</span>
                    <span className="task-time-mini">{task.created_at ? new Date(task.created_at).toLocaleString() : 'Recent'}</span>
                  </div>
                  <span className={`task-badge badge-${task.status}`}>{task.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={36} className="text-success" style={{ marginBottom: '0.75rem' }} />
              <p>{persona.name} task queue is clear. Delegations from Master CEO will appear here in real-time.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentWorkspace;
