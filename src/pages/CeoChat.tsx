import React, { useState } from 'react';
import { Send, Bot, User, Command, PlayCircle, Layers, Loader2 } from 'lucide-react';
import './CeoChat.css';
import { apiFetch } from '../lib/adminAuth';

interface Message {
  id: string;
  sender: 'ceo' | 'user';
  text: string;
  timestamp: string;
  delegations?: { agent_name: string; task: string }[];
}

const CeoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ceo',
      text: 'Good morning. I am the Master CEO Agent. I am currently monitoring all 5 divisions in the Tyneside Ecosystem. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the new Orchestration Backend
      const response = await apiFetch('/api/ceo/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Backend failed to respond');
      }

      const data = await response.json();

      const ceoResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ceo',
        text: data.reply || 'I am having trouble communicating with the orchestration engine right now.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        delegations: data.delegations
      };

      setMessages(prev => [...prev, ceoResponse]);
    } catch (error) {
      console.error('Error talking to CEO backend:', error);
      
      // Fallback if backend is not running
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ceo',
        text: '⚠️ Orchestration Engine Unreachable. Please make sure you have started the backend server (`cd backend && npm start`).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container animate-fade-in">
      <div className="chat-header glass-panel">
        <div className="chat-header-info">
          <Bot size={32} className="text-accent" />
          <div>
            <h2>Master CEO Agent</h2>
            <span className="status-online">● Online and Orchestrating</span>
          </div>
        </div>
        <div className="chat-actions">
          <button className="btn btn-secondary"><Command size={16}/> View Skills</button>
        </div>
      </div>

      <div className="chat-history">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message-wrapper ${msg.sender === 'user' ? 'message-right' : 'message-left'}`}>
            <div className="message-avatar">
              {msg.sender === 'ceo' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`chat-message ${msg.sender === 'ceo' ? 'message-ceo glass-panel' : 'message-user'}`}>
              <p>{msg.text}</p>
              {msg.delegations && msg.delegations.length > 0 && (
                <div className="delegation-box">
                  <div className="delegation-header">
                    <Layers size={14} />
                    <span>Delegated Tasks</span>
                  </div>
                  <ul className="delegation-list">
                    {msg.delegations.map((del, idx) => (
                      <li key={idx}>
                        <strong>{del.agent_name}:</strong> {del.task} <PlayCircle size={12} className="text-accent" style={{marginLeft: 'auto'}}/>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <span className="message-time">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message-wrapper message-left">
             <div className="message-avatar"><Bot size={20} /></div>
             <div className="chat-message message-ceo glass-panel" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7}}>
                <Loader2 size={16} className="spin" /> <span>CEO is orchestrating...</span>
             </div>
          </div>
        )}
      </div>

      <form className="chat-input-area glass-panel" onSubmit={handleSend}>
        <input 
          type="text" 
          className="input-field chat-input" 
          placeholder="Instruct the CEO (e.g. 'Launch a campaign' or 'Parent angry about bounced fee')..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary btn-icon" disabled={isLoading}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default CeoChat;
