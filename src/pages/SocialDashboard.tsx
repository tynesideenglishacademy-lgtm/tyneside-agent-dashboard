import React, { useState } from 'react';
import { 
  Share2, Brain, Film, Calendar, Upload, Plus, Palette, Type, 
  Sparkles, Image as ImageIcon, FileText, Clock, 
  Layers, Copy, Check, Video, Eye
} from 'lucide-react';
import './SocialDashboard.css';

interface BrandAsset {
  id: string;
  name: string;
  type: 'logo' | 'image' | 'pdf' | 'font';
  size: string;
  date: string;
}

interface ScheduledPost {
  id: string;
  title: string;
  platform: 'Instagram' | 'Facebook' | 'TikTok' | 'LinkedIn';
  date: string;
  time: string;
  status: 'Scheduled' | 'Draft' | 'Published';
}

const SocialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'brain' | 'post' | 'video' | 'calendar'>('brain');
  
  // Brand Brain State
  const [brandColors] = useState([
    { name: 'Primary Accent', hex: '#66FCF1' },
    { name: 'Secondary Accent', hex: '#45A29E' },
    { name: 'Dark Surface', hex: '#0B0C10' },
    { name: 'Glass Border', hex: '#C5C6C7' }
  ]);

  const [brandVoice, setBrandVoice] = useState(
    'Professional, warm, encouraging, Cambridge-aligned, friendly for Spanish parents & students.'
  );

  const [brandFonts, setBrandFonts] = useState('Outfit (Headings), Inter (Body Text)');

  const [brandAssets] = useState<BrandAsset[]>([
    { id: '1', name: 'tyneside_logo_primary.png', type: 'logo', size: '1.2 MB', date: 'Yesterday' },
    { id: '2', name: 'cambridge_prep_guide.pdf', type: 'pdf', size: '4.5 MB', date: '3 days ago' },
    { id: '3', name: 'academy_classroom_photo.jpg', type: 'image', size: '3.1 MB', date: '1 week ago' },
  ]);

  // Post Generator State
  const [postTopic, setPostTopic] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'Instagram' | 'Facebook' | 'LinkedIn'>('Instagram');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{ caption: string; prompt: string } | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Video Script State
  const [videoTopic, setVideoTopic] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<{ hook: string; value: string; cta: string } | null>(null);

  // Content Calendar State
  const [scheduledPosts] = useState<ScheduledPost[]>([
    { id: '1', title: '3 Phrasal Verbs for Cambridge B2 Speaking Test', platform: 'Instagram', date: 'July 24, 2026', time: '18:00', status: 'Scheduled' },
    { id: '2', title: 'Why Start English Early? YLE Course Announcement', platform: 'Facebook', date: 'July 26, 2026', time: '11:00', status: 'Scheduled' },
    { id: '3', title: 'Behind the Scenes: Teacher Training at Tyneside', platform: 'TikTok', date: 'July 28, 2026', time: '20:30', status: 'Draft' },
    { id: '4', title: 'Congratulations to our Q2 Cambridge Passers! 🎉', platform: 'Instagram', date: 'July 30, 2026', time: '17:00', status: 'Draft' },
  ]);

  const handleGeneratePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTopic.trim()) return;
    setIsGeneratingPost(true);

    setTimeout(() => {
      setGeneratedPost({
        caption: `Ready to master your ${postTopic}? 🚀 At Tyneside English Academy in Murcia, we specialize in helping students feel confident in speaking and passing their Cambridge exams!\n\n💡 Quick Tip: Always pay attention to prepositions in context.\n\n📍 Visit us in Puente Tocinos or DM us for a free 1-hour trial class!\n\n#TynesideAcademy #PuenteTocinos #MurciaIngles #CambridgeEnglish #AprenderIngles`,
        prompt: `A sleek, modern educational poster for Tyneside English Academy featuring clean typography, neon accent lines (#66FCF1), dark glassmorphism background, showcasing Cambridge study material.`
      });
      setIsGeneratingPost(false);
    }, 1500);
  };

  const handleGenerateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTopic.trim()) return;
    setIsGeneratingVideo(true);

    setTimeout(() => {
      setGeneratedVideo({
        hook: `Stop making this common B2 mistake with ${videoTopic}! 🛑`,
        value: `Most Spanish speakers translate directly from Spanish, but in Cambridge English, native speakers use this exact phrasal verb instead... (Show side-by-side example on screen).`,
        cta: `Save this Reel for your exam revision and comment 'B2' for our free Cambridge prep guide!`
      });
      setIsGeneratingVideo(false);
    }, 1500);
  };

  const handleCopyCaption = () => {
    if (generatedPost) {
      navigator.clipboard.writeText(generatedPost.caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  return (
    <div className="social-container animate-fade-in">
      {/* Header */}
      <div className="social-header glass-panel">
        <div className="social-header-title">
          <Share2 size={32} className="text-accent" />
          <div>
            <h1>Social Media & Brand Brain Studio</h1>
            <p className="subtitle">Contextual AI content generation backed by your official brand guidelines.</p>
          </div>
        </div>

        {/* Studio Tabs */}
        <div className="studio-tabs">
          <button className={`tab-btn ${activeTab === 'brain' ? 'active' : ''}`} onClick={() => setActiveTab('brain')}>
            <Brain size={16} /> Brand Brain & Assets
          </button>
          <button className={`tab-btn ${activeTab === 'post' ? 'active' : ''}`} onClick={() => setActiveTab('post')}>
            <Sparkles size={16} /> Post & Caption Creator
          </button>
          <button className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')}>
            <Film size={16} /> Video Script Studio
          </button>
          <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
            <Calendar size={16} /> Content Calendar
          </button>
        </div>
      </div>

      {/* TAB 1: BRAND BRAIN */}
      {activeTab === 'brain' && (
        <div className="brand-brain-grid animate-fade-in">
          {/* Brand Identity Panel */}
          <div className="brand-card glass-panel">
            <h3><Palette size={18} className="text-accent" /> Official Color Palette</h3>
            <div className="color-grid">
              {brandColors.map((color, idx) => (
                <div key={idx} className="color-swatch-box">
                  <div className="color-preview" style={{ backgroundColor: color.hex }} />
                  <div className="color-info">
                    <span className="color-name">{color.name}</span>
                    <span className="color-hex">{color.hex}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '1.5rem' }}><Type size={18} className="text-accent" /> Typography & Fonts</h3>
            <div className="input-group-compact">
              <input 
                type="text" 
                className="input-field" 
                value={brandFonts} 
                onChange={(e) => setBrandFonts(e.target.value)}
              />
            </div>

            <h3 style={{ marginTop: '1.5rem' }}><Layers size={18} className="text-accent" /> Brand Voice & Persona Rules</h3>
            <textarea 
              className="input-field brand-voice-textarea"
              rows={4}
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
            />
          </div>

          {/* Asset Vault Panel */}
          <div className="brand-card glass-panel">
            <div className="card-header-flex">
              <h3><Upload size={18} className="text-accent" /> Brand Media Vault (PNGs, PDFs, Logos)</h3>
              <button className="btn btn-secondary btn-sm"><Plus size={14} /> Upload Asset</button>
            </div>

            <div className="dropzone-mini">
              <Upload size={24} className="text-secondary" />
              <span>Drag & Drop logos, brand guides, or PNG assets here to seed the AI brain</span>
            </div>

            <div className="asset-list">
              {brandAssets.map(asset => (
                <div key={asset.id} className="asset-item">
                  <div className="asset-icon">
                    {asset.type === 'logo' && <ImageIcon size={20} className="text-accent" />}
                    {asset.type === 'pdf' && <FileText size={20} className="text-warning" />}
                    {asset.type === 'image' && <ImageIcon size={20} className="text-success" />}
                  </div>
                  <div className="asset-details">
                    <span className="asset-name">{asset.name}</span>
                    <span className="asset-meta">{asset.size} • Uploaded {asset.date}</span>
                  </div>
                  <span className="asset-badge">{asset.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POST GENERATOR */}
      {activeTab === 'post' && (
        <div className="post-creator-grid animate-fade-in">
          {/* Creator Controls */}
          <div className="creator-panel glass-panel">
            <h3><Sparkles size={18} className="text-accent" /> Generate Social Media Post</h3>
            <form onSubmit={handleGeneratePost}>
              <div className="form-group">
                <label>Platform Target</label>
                <div className="platform-selector">
                  {(['Instagram', 'Facebook', 'LinkedIn'] as const).map(platform => (
                    <button 
                      type="button"
                      key={platform} 
                      className={`platform-btn ${selectedPlatform === platform ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform(platform)}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Post Topic or Campaign Focus</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Cambridge B2 Exam Tips or YLE Summer Registration"
                  value={postTopic}
                  onChange={e => setPostTopic(e.target.value)}
                />
              </div>

              <div className="context-indicator">
                <Brain size={14} className="text-accent" />
                <span>AI will automatically apply Brand Brain colors, tone, and local Murcia tags.</span>
              </div>

              <button type="submit" className="btn btn-primary width-full" disabled={isGeneratingPost}>
                {isGeneratingPost ? 'Social Media Agent Generating...' : 'Generate Caption & Visual Prompt'}
              </button>
            </form>
          </div>

          {/* Generated Result & Preview */}
          <div className="preview-panel glass-panel">
            <h3><Eye size={18} className="text-accent" /> Live Generation Preview</h3>
            {generatedPost ? (
              <div className="generated-output">
                <div className="output-section">
                  <div className="section-header-flex">
                    <label>Generated {selectedPlatform} Caption</label>
                    <button className="btn btn-secondary btn-sm" onClick={handleCopyCaption}>
                      {copiedCaption ? <Check size={14} /> : <Copy size={14} />} {copiedCaption ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <textarea className="input-field output-textarea" rows={5} readOnly value={generatedPost.caption} />
                </div>

                <div className="output-section" style={{ marginTop: '1rem' }}>
                  <div className="section-header-flex">
                    <label>Open-Higgsfield / Flux.2 Visual Prompt & AI Render</label>
                    <a 
                      href={`https://image.pollinations.ai/prompt/${encodeURIComponent(generatedPost.prompt)}?width=800&height=800&nologo=true`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary btn-sm"
                    >
                      <ImageIcon size={14} /> Open Full High-Res Image
                    </a>
                  </div>
                  <code className="code-block" style={{ marginBottom: '1rem' }}>{generatedPost.prompt}</code>

                  {/* Live Rendered Image Container */}
                  <div className="live-image-render-container" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Sparkles size={14} className="text-accent" />
                      <span>Live Rendered Image (Flux.2 / Open-Higgsfield Engine)</span>
                    </div>
                    <img 
                      src={`https://image.pollinations.ai/prompt/${encodeURIComponent(generatedPost.prompt)}?width=800&height=800&nologo=true`} 
                      alt="AI Generated Promo" 
                      style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <Sparkles size={36} className="text-secondary opacity-50" />
                <p>Enter a topic on the left and click Generate to see live Brand-aligned content & AI images.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VIDEO SCRIPT STUDIO */}
      {activeTab === 'video' && (
        <div className="post-creator-grid animate-fade-in">
          <div className="creator-panel glass-panel">
            <h3><Film size={18} className="text-accent" /> 30-60s Reel / TikTok Script Generator</h3>
            <form onSubmit={handleGenerateVideo}>
              <div className="form-group">
                <label>Video Concept or Educational Skill</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. 3 common mistakes in Cambridge Speaking Part 2"
                  value={videoTopic}
                  onChange={e => setVideoTopic(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary width-full" disabled={isGeneratingVideo}>
                {isGeneratingVideo ? 'Video Generator Agent Writing...' : 'Generate Short-Form Script'}
              </button>
            </form>
          </div>

          <div className="preview-panel glass-panel">
            <h3><Video size={18} className="text-accent" /> High-Retention Script Preview</h3>
            {generatedVideo ? (
              <div className="script-container">
                <div className="script-block hook-block">
                  <span className="script-tag">Hook (0 - 3s)</span>
                  <p>{generatedVideo.hook}</p>
                </div>
                <div className="script-block value-block">
                  <span className="script-tag">Value & Lesson (3 - 45s)</span>
                  <p>{generatedVideo.value}</p>
                </div>
                <div className="script-block cta-block">
                  <span className="script-tag">Call To Action (45 - 60s)</span>
                  <p>{generatedVideo.cta}</p>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary width-full"
                    onClick={() => {
                      if ('speechSynthesis' in window && generatedVideo) {
                        window.speechSynthesis.cancel();
                        const textToSay = `${generatedVideo.hook}. ${generatedVideo.value}. ${generatedVideo.cta}`;
                        const utterance = new SpeechSynthesisUtterance(textToSay);
                        utterance.rate = 1.0;
                        utterance.pitch = 1.0;
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                  >
                    🔊 Play Voiceover Draft (Voicebox Speech Synthesis)
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    }}
                  >
                    ⏹️ Stop
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <Film size={36} className="text-secondary opacity-50" />
                <p>Enter a video topic to generate a structured 3-part Reel script.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE CONTENT CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="calendar-panel glass-panel animate-fade-in">
          <div className="card-header-flex">
            <h3><Calendar size={18} className="text-accent" /> Upcoming Social Content Calendar</h3>
            <button className="btn btn-primary btn-sm"><Plus size={14} /> Schedule New Post</button>
          </div>

          <div className="calendar-grid">
            {scheduledPosts.map(post => (
              <div key={post.id} className="calendar-card glass-panel">
                <div className="calendar-card-header">
                  <span className={`platform-badge platform-${post.platform.toLowerCase()}`}>{post.platform}</span>
                  <span className={`status-badge status-${post.status.toLowerCase()}`}>{post.status}</span>
                </div>
                <h4 className="calendar-title">{post.title}</h4>
                <div className="calendar-meta">
                  <Clock size={14} className="text-secondary" />
                  <span>{post.date} at {post.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialDashboard;
