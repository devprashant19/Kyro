import { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, FileText, Star, Settings, 
  Plus, MoreHorizontal, MessageSquare, ChevronRight, Hash, Sparkles, Share2, PanelLeftClose, User, Network, Clock, Inbox, BarChart2, TrendingUp, DownloadCloud, GitCommit, Bot, Mail, Activity, Zap, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphVisualizer from '../components/GraphVisualizer';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'Live Feed';
  });
  
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('kyro_sidebar_width');
    return saved ? parseInt(saved, 10) : 260;
  });
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSidebar) return;
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (isDraggingSidebar) {
        setIsDraggingSidebar(false);
        localStorage.setItem('kyro_sidebar_width', sidebarWidth.toString());
      }
    };
    
    if (isDraggingSidebar) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDraggingSidebar, sidebarWidth]);
  const [workspaceDocs, setWorkspaceDocs] = useState<{id: string, title: string, content: string}[]>(() => {
    try {
      const saved = localStorage.getItem('kyro_workspace_docs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse workspace docs from localStorage", e);
    }
    return [
      { id: 'doc_project_ideas', title: 'Project Ideas', content: '' },
      { id: 'doc_meeting_notes', title: 'Meeting Notes', content: '' }
    ];
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('kyro_workspace_docs', JSON.stringify(workspaceDocs));
  }, [workspaceDocs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-full w-full bg-gradient-animate text-white overflow-hidden selection:bg-indigo-500/30 relative">
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSelectTab={setActiveTab} workspaceDocs={workspaceDocs} />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] bg-zinc-900 border border-white/10 shadow-2xl px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles size={16} />
            </div>
            <span className="text-sm font-medium text-white">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative ambient light (like extension) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div 
        style={{ width: sidebarOpen ? (window.innerWidth < 768 ? 260 : sidebarWidth) : 0 }}
        className={`fixed md:relative ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0'
        } h-full ${isDraggingSidebar ? '' : 'transition-all duration-300'} ease-in-out glass-sidebar flex flex-col z-40 overflow-hidden shrink-0`}
      >
        {/* Resizer Handle */}
        <div 
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingSidebar(true);
          }}
          className="hidden md:block absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/50 z-50 transition-colors"
          style={{ backgroundColor: isDraggingSidebar ? 'rgba(59, 130, 246, 0.5)' : 'transparent' }}
        />
        <div className="p-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5 font-bold text-white text-lg tracking-tight group cursor-pointer">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 shadow-md border border-white/10">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400 text-sm font-bold">K</span>
              </div>
            </div>
            Kyro
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 hover:bg-white/5 rounded-md text-zinc-400 transition-colors">
            <PanelLeftClose size={16} />
          </button>
          <button onClick={() => setSidebarOpen(false)} className="hidden md:block p-1.5 hover:bg-white/5 rounded-md text-zinc-400 transition-colors">
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="px-3 pb-3">
          <div onClick={() => { setCommandPaletteOpen(true); if(window.innerWidth < 768) setSidebarOpen(false); }} className="group flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 border border-transparent hover:border-white/5 transition-all cursor-pointer">
            <Search size={16} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
            <span className="flex-1 text-left">Search...</span>
            <span className="text-[10px] font-semibold bg-black/20 px-1.5 py-0.5 rounded text-zinc-500 border border-white/5">⌘K</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div className="space-y-0.5">
            <SidebarItem icon={<Clock size={16} />} label="Live Feed" active={activeTab === 'Live Feed'} onClick={() => { setActiveTab('Live Feed'); if(window.innerWidth < 768) setSidebarOpen(false); }} />
            <SidebarItem icon={<MessageSquare size={16} />} label="Chat" active={activeTab === 'Chat'} onClick={() => { setActiveTab('Chat'); if(window.innerWidth < 768) setSidebarOpen(false); }} />
            <SidebarItem icon={<Network size={16} />} label="Brain" active={activeTab === 'Brain'} onClick={() => { setActiveTab('Brain'); if(window.innerWidth < 768) setSidebarOpen(false); }} />
            <SidebarItem icon={<GitCommit size={16} />} label="Timeline" active={activeTab === 'Timeline'} onClick={() => { setActiveTab('Timeline'); if(window.innerWidth < 768) setSidebarOpen(false); }} />
            <SidebarItem icon={<Star size={16} />} label="Favorites" active={activeTab === 'Favorites'} onClick={() => { setActiveTab('Favorites'); if(window.innerWidth < 768) setSidebarOpen(false); }} />
            <SidebarItem icon={<BarChart2 size={16} />} label="Insights" active={activeTab === 'Insights'} onClick={() => { setActiveTab('Insights'); if(window.innerWidth < 768) setSidebarOpen(false); }} />
            <SidebarItem icon={<DownloadCloud size={16} />} label="Upload Knowledge" active={activeTab === 'Upload Knowledge'} onClick={() => { setActiveTab('Upload Knowledge'); if(window.innerWidth < 768) setSidebarOpen(false); }} />
            <SidebarItem icon={<Settings size={16} />} label="Settings" active={activeTab === 'Settings'} onClick={() => { setActiveTab('Settings'); if(window.innerWidth < 768) setSidebarOpen(false); }} />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 px-2 mb-1.5 uppercase tracking-wider">
              <span>Personal Workspace</span>
              <button onClick={() => {
                const newDoc = { id: `doc_${Date.now()}`, title: 'Untitled', content: '' };
                setWorkspaceDocs([...workspaceDocs, newDoc]);
                setActiveTab(newDoc.id);
                if(window.innerWidth < 768) setSidebarOpen(false);
              }} className="hover:text-white hover:bg-white/10 p-1 rounded transition-colors"><Plus size={14} /></button>
            </div>
            <div className="space-y-0.5">
              <SidebarItem icon={<FileText size={16} />} label="Getting Started" active={activeTab === 'Getting Started'} onClick={() => { setActiveTab('Getting Started'); if(window.innerWidth < 768) setSidebarOpen(false); }} />
              {workspaceDocs.map(doc => (
                <SidebarItem 
                  key={doc.id} 
                  icon={<Hash size={16} />} 
                  label={doc.title || 'Untitled'} 
                  active={activeTab === doc.id} 
                  onClick={() => { setActiveTab(doc.id); if(window.innerWidth < 768) setSidebarOpen(false); }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    const newDocs = workspaceDocs.filter(d => d.id !== doc.id);
                    setWorkspaceDocs(newDocs);
                    if (activeTab === doc.id) {
                      setActiveTab(newDocs.length > 0 ? newDocs[0].id : 'Getting Started');
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        

      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden w-full">
        
        <header className="h-14 glass-header flex items-center px-4 pl-4 sticky top-0 z-10 justify-between">
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            {(!sidebarOpen || window.innerWidth < 768) && (
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-1.5 mr-2 hover:bg-white/10 rounded-md text-zinc-400 transition-colors md:mr-2"
              >
                <Menu size={16} />
              </button>
            )}
            <span className="hover:text-white cursor-pointer transition-colors font-medium hidden sm:inline">
              {(activeTab === 'Getting Started' || workspaceDocs.some(d => d.id === activeTab)) ? 'Personal Workspace' : 'Overview'}
            </span>
            <ChevronRight size={14} className="text-zinc-600 hidden sm:inline" />
            <span className="text-zinc-200 font-medium">
              {workspaceDocs.find(d => d.id === activeTab)?.title || activeTab}
            </span>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Link copied to clipboard!'); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition-colors">
               <Share2 size={14} /> <span className="hidden sm:inline">Share</span>
             </button>
             <button onClick={() => showToast('More options coming soon!')} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 transition-colors">
               <MoreHorizontal size={18} />
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-4xl mx-auto py-8 md:py-16 px-4 sm:px-6 md:px-10">
            {workspaceDocs.find(d => d.id === activeTab) ? (
              <WorkspaceDocument 
                doc={workspaceDocs.find(d => d.id === activeTab)!} 
                updateDoc={(id, updates) => {
                  setWorkspaceDocs(docs => docs.map(d => d.id === id ? { ...d, ...updates } : d));
                }} 
              />
            ) : (
              <h1 className="text-[40px] font-bold text-white mb-8 tracking-tight">
                {activeTab}
              </h1>
            )}
            
            {activeTab === 'Favorites' && (
              <FavoritesComponent />
            )}

            {activeTab === 'Live Feed' && (
              <LiveFeed />
            )}

            {activeTab === 'Brain' && (
              <div className="relative z-10">
                <p className="text-zinc-400 text-lg mb-4">Visualize your live knowledge graph built by Cognee.</p>
                <GraphVisualizer />
              </div>
            )}
            
            {activeTab === 'Insights' && (
              <InsightsPanel />
            )}

            {activeTab === 'Timeline' && (
              <TimelineComponent />
            )}

            {activeTab === 'Getting Started' && (
              <GettingStarted setActiveTab={setActiveTab} />
            )}
            
            {activeTab === 'Settings' && (
              <SettingsPanel />
            )}

            {activeTab === 'Upload Knowledge' && (
              <DataIngestionPanel />
            )}
            
            {activeTab === 'Chat' && (
              <ChatComponent />
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}

function WorkspaceDocument({ doc, updateDoc }: { doc: {id: string, title: string, content: string}, updateDoc: (id: string, updates: any) => void }) {
  return (
    <div className="w-full relative z-10 animate-fade-in flex flex-col h-full min-h-[60vh]">
      <input 
        type="text" 
        value={doc.title} 
        onChange={e => updateDoc(doc.id, { title: e.target.value })}
        className="w-full text-[40px] font-bold text-white mb-6 outline-none bg-transparent placeholder-zinc-700 tracking-tight"
        placeholder="Untitled Page"
      />
      <textarea 
        value={doc.content}
        onChange={e => updateDoc(doc.id, { content: e.target.value })}
        className="w-full flex-1 bg-transparent text-zinc-300 text-lg leading-relaxed outline-none resize-none placeholder-zinc-600"
        placeholder="Start typing your thoughts here... Kyro is listening."
      />
    </div>
  );
}

interface ChatSession {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  updatedAt: number;
}

function ChatComponent() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [relatedMemories, setRelatedMemories] = useState<{id: string, label: string}[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('kyro_chat_sessions');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
        setMessages(parsed[0].messages);
      }
    }
  }, []);

  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem('kyro_chat_sessions', JSON.stringify(updatedSessions));
  };

  const createNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setRelatedMemories([]);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    if (activeSessionId === id) {
      createNewSession();
    }
  };

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || input;
    if (!textToSend.trim()) return;
    
    const userMsg = { role: 'user', content: textToSend };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!overridePrompt) setInput('');
    setLoading(true);
    setRelatedMemories([]);

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = Date.now().toString();
      setActiveSessionId(currentSessionId);
      const newSession: ChatSession = {
        id: currentSessionId,
        title: textToSend.length > 30 ? textToSend.substring(0, 30) + '...' : textToSend,
        messages: newMessages,
        updatedAt: Date.now()
      };
      saveSessions([newSession, ...sessions]);
    } else {
      const updatedSessions = sessions.map(s => 
        s.id === currentSessionId ? { ...s, messages: newMessages, updatedAt: Date.now() } : s
      ).sort((a, b) => b.updatedAt - a.updatedAt);
      saveSessions(updatedSessions);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Error connecting to Kyro brain.");
      }
      
      const assistantMsg = { role: 'assistant', content: data.answer || "No answer provided." };
      const updatedMessages = [...newMessages, assistantMsg];
      setMessages(updatedMessages);
      
      if (data.related_memories) setRelatedMemories(data.related_memories);

      setSessions(prev => {
        const updated = prev.map(s => 
          s.id === currentSessionId ? { ...s, messages: updatedMessages, updatedAt: Date.now() } : s
        );
        localStorage.setItem('kyro_chat_sessions', JSON.stringify(updated));
        return updated;
      });

    } catch (err) {
      console.error(err);
      const errorMsg = { role: 'assistant', content: "Error connecting to Kyro brain." };
      setMessages([...newMessages, errorMsg]);
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-180px)] md:h-[80vh]">
      {/* Sidebar for History */}
      <div className="w-full md:w-64 flex flex-col gap-4 shrink-0 h-48 md:h-full">
        <button 
          onClick={createNewSession}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all shadow-lg"
        >
          <Plus size={18} /> New Chat
        </button>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => {
                setActiveSessionId(session.id);
                setMessages(session.messages);
                setRelatedMemories([]);
              }}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${activeSessionId === session.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className={activeSessionId === session.id ? 'text-blue-400' : 'text-zinc-500'} />
                <span className="text-sm text-zinc-300 truncate">{session.title}</span>
              </div>
              <button 
                onClick={(e) => deleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-sm text-zinc-500 text-center mt-8">No past conversations.</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card rounded-2xl p-6 relative overflow-hidden group flex flex-col">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles size={120} className="text-blue-400" />
        </div>
        
        <div className="flex-1 space-y-6 overflow-y-auto mb-6 relative z-10 custom-scrollbar pr-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col justify-center items-center text-center mt-12 animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white shadow-2xl">
                  <Sparkles size={32} className="text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to Kyro AI</h3>
              <p className="text-zinc-400 max-w-md mx-auto mb-10 leading-relaxed">
                I have access to your personal context operating system. Ask me anything about your captured knowledge.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                {[
                  { title: "Summarize Activity", desc: "What have I been researching today?", icon: <Activity size={18} className="text-green-400" /> },
                  { title: "Draft an Email", desc: "Use my recent context to draft an update.", icon: <Mail size={18} className="text-blue-400" /> },
                  { title: "Connect the Dots", desc: "Find relationships in my saved articles.", icon: <Share2 size={18} className="text-purple-400" /> },
                  { title: "Key Insights", desc: "Extract the most important points from my data.", icon: <Zap size={18} className="text-yellow-400" /> },
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion.desc)}
                    className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col gap-2 group text-left relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2 font-medium text-zinc-200">
                      {suggestion.icon}
                      {suggestion.title}
                    </div>
                    <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">{suggestion.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className="relative flex-shrink-0">
                {msg.role === 'assistant' && <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30"></div>}
                <div className={`relative w-10 h-10 rounded-xl ${msg.role === 'user' ? 'bg-gradient-to-tr from-blue-500 to-purple-500' : 'bg-zinc-900 border border-white/10'} flex items-center justify-center text-white shadow-md`}>
                  {msg.role === 'user' ? <User size={20} /> : <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400">K</span>}
                </div>
              </div>
              <div className={`flex flex-col w-[85%] md:w-auto ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <p className="text-xs md:text-sm text-white font-semibold mb-1">{msg.role === 'user' ? 'You' : 'Kyro AI'}</p>
                <div className={`px-4 py-3 rounded-2xl md:max-w-lg text-[14px] md:text-[15px] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800/80 text-zinc-300'}`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
          {loading && <div className="text-zinc-500 text-sm italic pl-14">Kyro is thinking...</div>}
          
          {relatedMemories.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
            <div className="pl-14 mt-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Sources</p>
              <div className="flex flex-wrap gap-2">
                {relatedMemories.map(mem => (
                  <span key={mem.id} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-md text-zinc-400">
                    {mem.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative mt-auto z-10 pt-4 border-t border-white/5">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Kyro anything..." 
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            className={`w-full bg-zinc-900/50 border ${isTyping ? 'border-blue-500/50 ring-4 ring-blue-500/10' : 'border-white/10'} rounded-xl pl-4 pr-12 py-3 text-[15px] text-white focus:outline-none transition-all shadow-inner backdrop-blur-md placeholder:text-zinc-600`} 
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading}
            className={`absolute right-3 top-7 p-1.5 rounded-lg transition-all ${isTyping || input.trim() ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
            <Sparkles size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick = () => {}, onDelete }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, onDelete?: (e: React.MouseEvent) => void }) {
  return (
    <div className="group relative flex items-center w-full">
      <motion.button 
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`flex-1 flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors text-[13px] font-medium border border-transparent overflow-hidden ${
          active 
            ? 'bg-white/10 text-white border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
        }`}
      >
        <span className={`${active ? 'text-blue-400' : 'text-zinc-500'} transition-colors shrink-0`}>{icon}</span>
        <span className="truncate">{label}</span>
      </motion.button>
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all z-10"
          title="Delete page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      )}
    </div>
  );
}

function LiveFeed() {
  const [captures, setCaptures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem('kyro_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (cap: any) => {
    setFavorites(prev => {
      const isFav = prev.find(f => f.timestamp === cap.timestamp);
      const updated = isFav ? prev.filter(f => f.timestamp !== cap.timestamp) : [cap, ...prev];
      localStorage.setItem('kyro_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const fetchCaptures = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/recent`);
      const data = await res.json();
      setCaptures(data.captures || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCaptures();
    const interval = setInterval(fetchCaptures, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading live feed...</div>;
  if (captures.length === 0) return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 mt-8 text-center glass-card rounded-2xl border border-white/5"
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        <Inbox size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Your Brain is Empty</h3>
      <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
        Ensure the Kyro Chrome Extension is active, or use the Webhook API to inject your first memory. The Live Feed will automatically update when context arrives.
      </p>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {captures.map((cap, i) => (
          <motion.div 
            key={cap.timestamp || i}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
            className="glass-card p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              {cap.title}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">{new Date(cap.timestamp).toLocaleTimeString()}</span>
              <button 
                onClick={() => toggleFavorite(cap)} 
                className={`transition-colors ${favorites.find(f => f.timestamp === cap.timestamp) ? 'text-yellow-400' : 'text-zinc-500 hover:text-yellow-400'}`}
              >
                <Star size={14} className={favorites.find(f => f.timestamp === cap.timestamp) ? 'fill-current' : ''} />
              </button>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mb-3">{cap.text}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-zinc-500">{cap.domain}</span>
            <a href={cap.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300">View Source</a>
          </div>
        </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function FavoritesComponent() {
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem('kyro_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const removeFavorite = (timestamp: string) => {
    const updated = favorites.filter(f => f.timestamp !== timestamp);
    setFavorites(updated);
    localStorage.setItem('kyro_favorites', JSON.stringify(updated));
  };

  if (favorites.length === 0) return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 mt-8 text-center glass-card rounded-2xl border border-white/5"
    >
      <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
        <Star size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No Favorites Yet</h3>
      <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
        Star your most important context captures in the Live Feed to save them here for quick access.
      </p>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {favorites.map((cap, i) => (
          <motion.div 
            key={cap.timestamp || i}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
            className="glass-card p-5 rounded-xl border border-yellow-500/30 hover:border-yellow-400/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                {cap.title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">{new Date(cap.timestamp).toLocaleTimeString()}</span>
                <button onClick={() => removeFavorite(cap.timestamp)} className="text-yellow-400 hover:text-red-400 transition-colors" title="Remove from Favorites">
                  <Star size={14} className="fill-current" />
                </button>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-3">{cap.text}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-zinc-500">{cap.domain}</span>
              <a href={cap.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300">View Source</a>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SettingsPanel() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [wipeStatus, setWipeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleSave = async () => {
    setStatus('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/config/key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey })
      });
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleWipeData = async () => {
    if (!confirm("Are you sure? This will permanently delete all your context graphs and captures.")) return;
    setWipeStatus('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/data/wipe`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setWipeStatus('success');
        localStorage.removeItem('kyro_workspace_docs');
        localStorage.removeItem('kyro_favorites');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setWipeStatus('error');
      }
    } catch {
      setWipeStatus('error');
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/export`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateString = new Date().toISOString().replace('T', '_').split('.')[0].replace(/:/g, '-');
      a.download = `kyro_export_${dateString}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  return (
    <div className="max-w-3xl mt-8 pb-20 space-y-8 animate-fade-in">
      {/* API Configuration */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-blue-400" /> API Configuration
          </h2>
          <p className="text-zinc-400 mt-2 text-sm">Configure your Google Gemini API key to power Kyro's intelligence.</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Gemini API Key</label>
              <div className="flex gap-3">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                <button 
                  onClick={handleSave}
                  disabled={status === 'loading'}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Saving...' : status === 'success' ? 'Saved!' : status === 'error' ? 'Error' : 'Save Key'}
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">Your key is stored locally in your browser and sent securely to your local backend.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> 
            Data Management
          </h2>
          <p className="text-zinc-400 mt-2 text-sm">Control your personal graph data and local workspace memory.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div>
              <h3 className="text-white font-medium">Export Graph Data</h3>
              <p className="text-zinc-400 text-sm mt-1">Download all your captured contexts and metadata as a JSON file.</p>
            </div>
            <button onClick={handleExport} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
              Download JSON
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div>
              <h3 className="text-red-400 font-medium">Danger Zone: Wipe All Data</h3>
              <p className="text-red-400/70 text-sm mt-1">Permanently deletes all captured context, SQLite graphs, and local workspace docs.</p>
            </div>
            <button 
              onClick={handleWipeData}
              disabled={wipeStatus === 'loading' || wipeStatus === 'success'}
              className="px-5 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/30 whitespace-nowrap"
            >
              {wipeStatus === 'loading' ? 'Wiping...' : wipeStatus === 'success' ? 'Wiped!' : 'Wipe Brain'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandPalette({ isOpen, onClose, onSelectTab, workspaceDocs }: { isOpen: boolean, onClose: () => void, onSelectTab: (tab: string) => void, workspaceDocs: any[] }) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const actions = [
    { id: 'live-feed', label: 'Go to Live Feed', icon: <Clock size={16} />, action: () => onSelectTab('Live Feed') },
    { id: 'chat', label: 'Go to Chat', icon: <MessageSquare size={16} />, action: () => onSelectTab('Chat') },
    { id: 'brain', label: 'Go to Brain Visualizer', icon: <Network size={16} />, action: () => onSelectTab('Brain') },
    { id: 'settings', label: 'Go to Settings', icon: <Settings size={16} />, action: () => onSelectTab('Settings') },
    { id: 'upload', label: 'Upload Knowledge', icon: <DownloadCloud size={16} />, action: () => onSelectTab('Upload Knowledge') },
    { id: 'favorites', label: 'Go to Favorites', icon: <Star size={16} />, action: () => onSelectTab('Favorites') },
    ...workspaceDocs.map(doc => ({
      id: doc.id,
      label: `Open Document: ${doc.title || 'Untitled'}`,
      icon: <FileText size={16} />,
      action: () => onSelectTab(doc.id)
    }))
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search size={18} className="text-zinc-400" />
              <input 
                ref={inputRef}
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-[15px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filtered.length > 0) {
                    filtered[0].action();
                    onClose();
                    setSearch('');
                  }
                  if (e.key === 'Escape') {
                    onClose();
                  }
                }}
              />
              <span className="text-[10px] font-semibold bg-white/10 px-1.5 py-0.5 rounded text-zinc-400 border border-white/5">ESC</span>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length > 0 ? (
                <div className="space-y-1">
                  {filtered.map((action, i) => (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { action.action(); onClose(); setSearch(''); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${i === 0 && search.length > 0 ? 'bg-blue-500/20 text-blue-300' : 'text-zinc-300'}`}
                    >
                      <span className={i === 0 && search.length > 0 ? 'text-blue-400' : 'text-zinc-500'}>{action.icon}</span>
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-zinc-500">
                  No commands found.
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function GettingStarted({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <div className="max-w-5xl mx-auto pb-20 relative z-10 animate-fade-in">
      
      {/* Hero Section */}
      <div className="glass-card rounded-[32px] p-10 mb-12 border border-blue-500/20 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-1000 scale-150 transform translate-x-1/4 -translate-y-1/4">
          <Sparkles size={300} className="text-blue-400" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent z-0"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Context OS v1.0
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-zinc-400 mb-6 tracking-tight leading-tight">
            The AI That Never Forgets You.
          </h1>
          <p className="text-zinc-300 text-xl leading-relaxed font-light mb-8 max-w-2xl">
            Welcome to <strong className="text-white font-semibold">Kyro</strong>. It silently captures the context of your digital life—intercepting your thoughts across ChatGPT, Claude, Gemini, and Perplexity—weaving them into a continuous, local memory graph using <strong className="text-blue-400 font-medium">Cognee</strong> and <strong className="text-purple-400 font-medium">Gemini 1.5</strong>.
          </p>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('Brain')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2">
              <Network size={18} /> Explore Brain
            </button>
            <button onClick={() => setActiveTab('Settings')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-2">
              <Settings size={18} /> Configure API
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 px-2">Core Capabilities</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <Clock size={24} />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Universal Tracking</h4>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The browser extension runs silently in the background, intercepting your prompts from all major AI platforms before they are sent, capturing your raw train of thought.
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <Network size={24} />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Cognee Knowledge Graph</h4>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Captured context is fed into a local RAG engine. Entities and relationships are extracted to build a 3D structural graph of your knowledge.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Contextual RAG Chat</h4>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Query your own history. Ask Kyro questions and it will retrieve exactly what you were researching on Claude three days ago to answer you perfectly.
          </p>
        </div>
      </div>

      {/* Step by Step Guide */}
      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 px-2">How to Operate</h3>
      <div className="space-y-4">
        
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl shadow-lg border-4 border-zinc-900 z-10">
            1
          </div>
          <div className="flex-1 z-10">
            <h3 className="text-xl font-bold text-white mb-2">Configure the Engine</h3>
            <p className="text-zinc-400 leading-relaxed">
              Kyro requires an LLM to process information. Navigate to the <strong>Settings</strong> tab in the sidebar and paste your Gemini API Key. This securely activates the backend RAG pipeline and `Cognee` graph without needing to restart the server.
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold text-2xl shadow-lg border-4 border-zinc-900 z-10">
            2
          </div>
          <div className="flex-1 z-10">
            <h3 className="text-xl font-bold text-white mb-2">Activate the Trackers</h3>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Kyro works best when it's listening. Ensure the Kyro Chrome Extension is installed and active. Once running, simply use your favorite AI tools normally. Kyro will intercept and log your context automatically.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-black/40 rounded-lg border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> chatgpt.com</span>
              <span className="px-3 py-1.5 bg-black/40 rounded-lg border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> claude.ai</span>
              <span className="px-3 py-1.5 bg-black/40 rounded-lg border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> gemini.google.com</span>
              <span className="px-3 py-1.5 bg-black/40 rounded-lg border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> perplexity.ai</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white font-bold text-2xl shadow-lg border-4 border-zinc-900 z-10">
            3
          </div>
          <div className="flex-1 z-10">
            <h3 className="text-xl font-bold text-white mb-2">Explore the Graph</h3>
            <p className="text-zinc-400 leading-relaxed">
              As Kyro learns, your memory graph grows. Check the <strong>Live Feed</strong> to see data flowing from the extension in real-time. Jump into the <strong>Brain</strong> tab to explore a beautiful 3D visualization of how your ideas connect. When you're ready, use the <strong>Chat</strong> to talk directly to your augmented memory!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsPanel() {
  const [activity, setActivity] = useState<{date: string, count: number}[]>([]);
  const [clusters, setClusters] = useState<{concept: string, weight: number}[]>([]);
  const [stats, setStats] = useState({ total: 0, streak: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [activityRes, clustersRes, statsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/analytics/activity`),
          fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/analytics/clusters`),
          fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/analytics/stats`)
        ]);
        
        if (activityRes.ok) {
          const data = await activityRes.json();
          setActivity(data.activity || []);
        }
        if (clustersRes.ok) {
          const data = await clustersRes.json();
          setClusters(data.clusters || []);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/analytics/weekly-report`);
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      }
    } catch (err) {
      console.error(err);
      setReport("Failed to generate report. Please try again later.");
    }
    setGeneratingReport(false);
  };

  const totalCaptured = stats.total;
  
  const getColor = (count: number) => {
    if (count === 0) return 'bg-zinc-800/50';
    if (count === 1) return 'bg-blue-900/50';
    if (count === 2) return 'bg-blue-700/60';
    if (count === 3) return 'bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
    return 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]';
  };

  const getClusterStyle = (weight: number) => {
    if (weight > 80) return { size: 'text-xl py-3 px-6', color: 'from-blue-500 to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] border-transparent text-white' };
    if (weight > 60) return { size: 'text-lg py-2 px-5', color: 'from-blue-600/80 to-purple-600/80 border-white/10 text-zinc-100' };
    if (weight > 40) return { size: 'text-md py-1.5 px-4', color: 'from-zinc-800 to-zinc-700 border-white/10 text-zinc-300' };
    return { size: 'text-sm py-1 px-3', color: 'from-zinc-900 to-zinc-800 border-white/5 text-zinc-500' };
  };

  // Helper to parse simple markdown (bold and lists) for the report MVP
  const parseMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formattedLine = line;
      // Handle bold
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Handle list items
      if (formattedLine.startsWith('- ')) {
        return <li key={i} className="ml-4 mb-2" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
      }
      if (formattedLine.startsWith('1. ') || formattedLine.startsWith('2. ') || formattedLine.startsWith('3. ')) {
        return <h4 key={i} className="text-lg font-bold text-white mt-4 mb-2" dangerouslySetInnerHTML={{ __html: formattedLine.substring(3) }} />;
      }
      return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Network size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Total Memories</p>
            <p className="text-2xl font-bold text-white">{totalCaptured}</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Current Streak</p>
            <p className="text-2xl font-bold text-white">{stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Daily Average</p>
            <p className="text-2xl font-bold text-white">{stats.average} Contexts</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Activity Heatmap</h3>
        {loading ? (
          <div className="h-32 flex items-center justify-center text-zinc-500 animate-pulse text-sm">Synthesizing telemetry...</div>
        ) : (
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            <AnimatePresence>
              {activity.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.005, duration: 0.2 }}
                  title={`${day.date}: ${day.count} captures`}
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${getColor(day.count)} transition-all hover:scale-125 cursor-crosshair`}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-zinc-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-zinc-800/50" />
            <div className="w-3 h-3 rounded-sm bg-blue-900/50" />
            <div className="w-3 h-3 rounded-sm bg-blue-700/60" />
            <div className="w-3 h-3 rounded-sm bg-blue-500/80" />
            <div className="w-3 h-3 rounded-sm bg-purple-500" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Network size={200} />
        </div>
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Trending Concepts</h3>
        {loading ? (
          <div className="h-40 flex items-center justify-center text-zinc-500 animate-pulse text-sm">Clustering concepts...</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 py-8 items-center relative z-10">
            <AnimatePresence>
              {clusters.map((cluster, i) => {
                const style = getClusterStyle(cluster.weight);
                return (
                  <motion.div
                    key={cluster.concept}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring', bounce: 0.4 }}
                    className={`rounded-full bg-gradient-to-br ${style.color} ${style.size} font-bold shadow-lg border backdrop-blur-sm whitespace-nowrap`}
                  >
                    {cluster.concept}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* AI Weekly Summary Report */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Bot size={16} className="text-blue-400" />
              AI Weekly Synthesis
            </h3>
            <p className="text-sm text-zinc-500">Let Gemini analyze your captured context and generate an executive summary.</p>
          </div>
          {!report && (
            <button 
              onClick={generateReport}
              disabled={generatingReport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all font-medium text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={16} className={generatingReport ? "animate-pulse" : ""} />
              {generatingReport ? "Synthesizing..." : "Generate Report"}
            </button>
          )}
        </div>

        {report && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-white/5 pt-6"
          >
            <div className="text-zinc-300 text-sm leading-relaxed max-w-3xl prose prose-invert">
              {parseMarkdown(report)}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setReportSent(true)}
                disabled={reportSent}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm border ${
                  reportSent 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 cursor-default' 
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                }`}
              >
                {reportSent ? (
                  <>Sent Successfully ✓</>
                ) : (
                  <>
                    <Mail size={16} />
                    Email to Me
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}

function TimelineComponent() {
  const [captures, setCaptures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaptures = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/captures/recent`);
        if (response.ok) {
          const data = await response.json();
          setCaptures(data.captures || []);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchCaptures();
  }, []);

  if (loading) return <div className="text-zinc-500 animate-pulse mt-8">Reconstructing timeline...</div>;
  if (captures.length === 0) return (
    <div className="flex flex-col items-center justify-center p-12 mt-8 text-center glass-card rounded-2xl border border-white/5">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        <GitCommit size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
      <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
        Start capturing context to build your historical timeline.
      </p>
    </div>
  );

  return (
    <div className="relative border-l border-zinc-800 ml-6 md:ml-12 mt-8 pb-12 space-y-10">
      <AnimatePresence>
        {captures.map((capture, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="relative pl-8 md:pl-10"
          >
            {/* Timeline node */}
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10" />
            
            <div className="glass-card p-5 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-400 transition-colors">{capture.title}</h3>
                <span className="text-xs text-zinc-500 bg-zinc-900/80 px-2.5 py-1 rounded-md border border-white/5 whitespace-nowrap">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 mb-4">
                {capture.text}
              </p>
              <div className="flex items-center justify-between">
                <a href={capture.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
                  {new URL(capture.url).hostname}
                </a>
                <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold bg-white/5 px-2 py-0.5 rounded">
                  {capture.type || 'web_page'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}



function DataIngestionPanel() {
  const [ingestMode, setIngestMode] = useState<'text' | 'pdf'>('text');
  
  // Text Ingestion State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  
  // PDF Ingestion State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Status
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text) return;
    
    setStatus('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/ingest/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          url: url || "manual://upload",
          text,
          type: "custom_api",
          metadata: { manual_entry: true }
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setStatusMsg(data.message);
        setTitle('');
        setUrl('');
        setText('');
      } else {
        setStatus('error');
        setStatusMsg(data.detail || 'Error uploading context.');
      }
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err.message || 'Network error.');
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setStatus('loading');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/upload/pdf`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setStatusMsg(`${data.message} (${data.pages} pages extracted).`);
        setFile(null);
      } else {
        setStatus('error');
        setStatusMsg(data.detail || 'Error uploading PDF.');
      }
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err.message || 'Network error.');
    }
  };

  return (
    <div className="max-w-3xl space-y-6 mt-8 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <DownloadCloud className="text-blue-400" size={28} /> Upload Knowledge
          </h2>
          <p className="text-zinc-400 mt-2 text-[15px] leading-relaxed">
            Manually feed data directly into Kyro's Cognee engine. This bypasses the extension and injects context directly into your Semantic Knowledge Graph.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6 pt-4 gap-6">
          <button 
            onClick={() => setIngestMode('text')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${ingestMode === 'text' ? 'text-blue-400 border-blue-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
          >
            Custom Text
          </button>
          <button 
            onClick={() => setIngestMode('pdf')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${ingestMode === 'pdf' ? 'text-purple-400 border-purple-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
          >
            PDF Document
          </button>
        </div>
        
        <div className="p-6">
          
          {/* Status Message */}
          <AnimatePresence>
            {status !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  status === 'loading' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300' : 
                  status === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 
                  'bg-red-500/10 border border-red-500/20 text-red-300'
                }`}
              >
                {status === 'loading' && <Sparkles className="animate-spin" size={18} />}
                <span className="text-sm font-medium">{status === 'loading' ? 'Chunking and digesting into Cognee Graph...' : statusMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Form */}
          {ingestMode === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Document Title *</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Roadmap Brainstorming"
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Source URL (Optional)</label>
                <input 
                  type="url" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Raw Text Content *</label>
                <textarea 
                  required
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Paste your raw text, notes, or code here..."
                  className="w-full h-48 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none placeholder:text-zinc-600"
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={status === 'loading' || !title || !text}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                  <DownloadCloud size={18} /> Ingest to Graph
                </button>
              </div>
            </form>
          )}

          {/* PDF Form */}
          {ingestMode === 'pdf' && (
            <div className="space-y-6">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const dropped = e.dataTransfer.files[0];
                    if (dropped.type === 'application/pdf') {
                      setFile(dropped);
                    } else {
                      setStatus('error');
                      setStatusMsg('Please upload a valid PDF file.');
                    }
                  }
                }}
                className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isDragging 
                    ? 'border-purple-500 bg-purple-500/10 shadow-[inset_0_0_20px_rgba(168,85,247,0.2)]' 
                    : file 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {!file ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 mb-4">
                      <FileText size={32} />
                    </div>
                    <p className="text-zinc-300 font-medium mb-1">Drag and drop your PDF here</p>
                    <p className="text-zinc-500 text-sm mb-4">Maximum file size: 10MB</p>
                    
                    <label className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors border border-white/5">
                      Browse Files
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                      <FileText size={32} />
                    </div>
                    <p className="text-white font-medium mb-1">{file.name}</p>
                    <p className="text-zinc-400 text-sm mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
                    >
                      Remove File
                    </button>
                  </>
                )}
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={handleFileUpload}
                  disabled={status === 'loading' || !file}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  <Sparkles size={18} /> Parse & Ingest PDF
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
