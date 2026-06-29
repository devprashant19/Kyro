import React, { useState } from 'react';
import { 
  Menu, Search, Home, FileText, Star, Settings, 
  Plus, MoreHorizontal, MessageSquare, ChevronRight, Hash, Sparkles, Share2, PanelLeftClose, User
} from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('All Pages');
  const [isTyping, setIsTyping] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gradient-animate text-white overflow-hidden selection:bg-indigo-500/30 relative">
      
      {/* Decorative ambient light (like extension) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'w-[260px]' : 'w-0'
        } transition-all duration-300 ease-in-out glass-sidebar flex flex-col z-20`}
      >
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
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-white/5 rounded-md text-zinc-400 transition-colors">
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="px-3 pb-3">
          <div className="group flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 border border-transparent hover:border-white/5 transition-all cursor-pointer">
            <Search size={16} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
            <span className="flex-1 text-left">Search...</span>
            <span className="text-[10px] font-semibold bg-black/20 px-1.5 py-0.5 rounded text-zinc-500 border border-white/5">⌘K</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div className="space-y-0.5">
            <SidebarItem icon={<Home size={16} />} label="All Pages" active={activeTab === 'All Pages'} onClick={() => setActiveTab('All Pages')} />
            <SidebarItem icon={<MessageSquare size={16} />} label="Chat" active={activeTab === 'Chat'} onClick={() => setActiveTab('Chat')} />
            <SidebarItem icon={<Star size={16} />} label="Favorites" active={activeTab === 'Favorites'} onClick={() => setActiveTab('Favorites')} />
            <SidebarItem icon={<Settings size={16} />} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 px-2 mb-1.5 uppercase tracking-wider">
              <span>Personal Workspace</span>
              <button className="hover:text-white hover:bg-white/10 p-1 rounded transition-colors"><Plus size={14} /></button>
            </div>
            <div className="space-y-0.5">
              <SidebarItem icon={<FileText size={16} />} label="Getting Started" />
              <SidebarItem icon={<Hash size={16} />} label="Project Ideas" />
              <SidebarItem icon={<FileText size={16} />} label="Meeting Notes" />
            </div>
          </div>
        </div>
        
        <div className="p-3 border-t border-white/5">
          <button className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-all text-sm font-medium border border-transparent hover:border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center">
                <User size={14} />
              </div>
              <span className="text-zinc-300">User Account</span>
            </div>
            <MoreHorizontal size={16} className="text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        
        <header className="h-14 glass-header flex items-center px-4 pl-4 sticky top-0 z-10 justify-between">
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-1.5 mr-2 hover:bg-white/10 rounded-md text-zinc-400 transition-colors"
              >
                <Menu size={16} />
              </button>
            )}
            <span className="hover:text-white cursor-pointer transition-colors font-medium">Personal</span>
            <ChevronRight size={14} className="text-zinc-600" />
            <span className="text-zinc-200 font-medium">{activeTab}</span>
          </div>
          <div className="flex items-center gap-2">
             <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition-colors">
               <Share2 size={14} /> Share
             </button>
             <button className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 transition-colors">
               <MoreHorizontal size={18} />
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-4xl mx-auto py-16 px-10">
            <h1 className="text-[40px] font-bold text-white mb-8 outline-none placeholder-zinc-700 tracking-tight" contentEditable suppressContentEditableWarning data-placeholder="Untitled Page">
              {activeTab}
            </h1>
            
            <div className="space-y-5 text-lg text-zinc-300 leading-[1.7] relative z-10">
              <p className="prose-editor min-h-[1.5em]" contentEditable suppressContentEditableWarning data-placeholder="Type '/' for commands">
                Welcome to your new Kyro dashboard. This interface is built with React and TailwindCSS, bringing the beautiful dark glassmorphic aesthetics directly into your local environment.
              </p>
              <p className="prose-editor min-h-[1.5em]" contentEditable suppressContentEditableWarning>
                Try clicking around and typing. The backend can inject RAG context or memory captures seamlessly into this editor experience.
              </p>
            </div>
            
            {activeTab === 'Chat' && (
              <ChatComponent />
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}

function ChatComponent() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [relatedMemories, setRelatedMemories] = useState<{id: string, label: string}[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      if (data.related_memories) setRelatedMemories(data.related_memories);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to Kyro brain." }]);
    }
    setLoading(false);
  };

  return (
    <div className="mt-16 glass-card rounded-2xl p-6 relative overflow-hidden group flex flex-col">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} className="text-blue-400" />
      </div>
      
      <div className="flex-1 space-y-6 overflow-y-auto mb-6 relative z-10 min-h-[300px]">
        {messages.length === 0 && (
          <div className="flex gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30"></div>
              <div className="relative w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400">K</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-white font-semibold mb-1">Kyro AI</p>
              <p className="text-[15px] text-zinc-400 leading-relaxed">Hello! I have access to your personal context operating system. What would you like to recall today?</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-shrink-0">
              {msg.role === 'assistant' && <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30"></div>}
              <div className={`relative w-10 h-10 rounded-xl ${msg.role === 'user' ? 'bg-gradient-to-tr from-blue-500 to-purple-500' : 'bg-zinc-900 border border-white/10'} flex items-center justify-center text-white shadow-md`}>
                {msg.role === 'user' ? <User size={20} /> : <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400">K</span>}
              </div>
            </div>
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <p className="text-sm text-white font-semibold mb-1">{msg.role === 'user' ? 'You' : 'Kyro AI'}</p>
              <div className={`px-4 py-3 rounded-2xl max-w-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800/80 text-zinc-300'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
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
          onClick={handleSend}
          disabled={loading}
          className={`absolute right-3 top-7 p-1.5 rounded-lg transition-all ${isTyping ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
          <Sparkles size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick = () => {} }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all text-[13px] font-medium border border-transparent ${
        active 
          ? 'bg-white/10 text-white border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
      }`}
    >
      <span className={`${active ? 'text-blue-400' : 'text-zinc-500'}`}>{icon}</span>
      {label}
    </button>
  );
}

export default App;
