import { useState, useEffect } from 'react';
import { Trash2, Upload, Settings, Power, Activity, ExternalLink, ShieldCheck, Database, RefreshCw, Keyboard, Shield, X, Plus } from 'lucide-react';
import { useAuth } from '@clerk/chrome-extension';
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth';

function App() {
  const [isActive, setIsActive] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [recentCaptures, setRecentCaptures] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [captureKeybind, setCaptureKeybind] = useState<string>('Alt + C');
  const [isRecordingKeybind, setIsRecordingKeybind] = useState(false);

  // Privacy Controls state
  const [blocklist, setBlocklist] = useState<string[]>([]);
  const [blocklistMode, setBlocklistMode] = useState<'block' | 'allow'>('block');
  const [domainInput, setDomainInput] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['kyro_capture_keybind', 'kyro_blocklist', 'kyro_blocklist_mode'], (result) => {
      if (result.kyro_capture_keybind) setCaptureKeybind(result.kyro_capture_keybind);
      if (result.kyro_blocklist) setBlocklist(result.kyro_blocklist);
      if (result.kyro_blocklist_mode) setBlocklistMode(result.kyro_blocklist_mode);
    });
  }, []);

  const addBlocklistDomain = () => {
    const domain = domainInput.trim().replace(/https?:\/\//, '').replace(/\/.*/, '').toLowerCase();
    if (!domain || blocklist.includes(domain)) { setDomainInput(''); return; }
    const updated = [...blocklist, domain];
    setBlocklist(updated);
    chrome.storage.local.set({ kyro_blocklist: updated });
    setDomainInput('');
    setToastMessage(`Added: ${domain}`);
  };

  const removeBlocklistDomain = (domain: string) => {
    const updated = blocklist.filter(d => d !== domain);
    setBlocklist(updated);
    chrome.storage.local.set({ kyro_blocklist: updated });
  };

  const toggleBlocklistMode = () => {
    const next = blocklistMode === 'block' ? 'allow' : 'block';
    setBlocklistMode(next);
    chrome.storage.local.set({ kyro_blocklist_mode: next });
    setToastMessage(next === 'block' ? 'Mode: Block listed domains' : 'Mode: Allow listed domains only');
  };

  const handleKeybindRecord = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.key === 'Escape') {
      setIsRecordingKeybind(false);
      return;
    }
    
    // Ignore pure modifier presses
    if (['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) return;

    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Cmd');
    
    parts.push(e.key.toUpperCase());
    const newBind = parts.join(' + ');
    
    setCaptureKeybind(newBind);
    chrome.storage.local.set({ kyro_capture_keybind: newBind });
    setIsRecordingKeybind(false);
    setToastMessage(`Hotkey saved: ${newBind}`);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Clerk Auth State
  const { isLoaded, isSignedIn, signOut } = useAuth();

  // Routing State
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('kyro_onboarding_complete') !== 'true';
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const healthRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/health`);
        if (healthRes.ok) setBackendConnected(true);
        else setBackendConnected(false);

        const recentRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/recent`);
        if (recentRes.ok) {
          const data = await recentRes.json();
          setRecentCaptures(data.captures || []);
        }
      } catch {
        setBackendConnected(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate a random sync pulse
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, [isActive]);

  if (showOnboarding) {
    return <Onboarding onComplete={() => {
      localStorage.setItem('kyro_onboarding_complete', 'true');
      setShowOnboarding(false);
    }} />;
  }

  if (!isLoaded) {
    return <div className="h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Auth onComplete={() => {
      // In dev mode, they can skip. In production, we don't use this.
    }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-animate text-white overflow-hidden relative">
      {/* Decorative ambient light */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-[60px] pointer-events-none"></div>

      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-white/10 text-white text-xs px-4 py-2 rounded-full shadow-xl shadow-black/50 animate-fade-in whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="glass-panel px-5 py-4 flex items-center justify-between z-10 sticky top-0 border-b-0 border-white/10 rounded-b-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden">
              <img src="/icons/icon128.png" alt="Kyro" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Kyro</h1>
            <p className="text-[10px] text-blue-300/80 font-medium tracking-wide uppercase">Context OS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => signOut()}
            className="text-xs font-medium bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 text-zinc-300"
          >
            <Power size={12} className="text-red-400" /> Sign Out
          </button>
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-sm border ${isActive
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
          >
            <Power size={12} className={isActive ? 'animate-pulse' : ''} />
            {isActive ? 'Active' : 'Paused'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4 z-10">

        {/* Status Card */}
        <div className="glass-panel rounded-xl p-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex justify-between items-start mb-3">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              <Activity size={14} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
              Connection
            </h2>
            {isSyncing && isActive && (
              <span className="flex items-center gap-1 text-[10px] text-blue-400 font-medium animate-pulse">
                <RefreshCw size={10} className="animate-spin" /> Syncing
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className={`relative flex h-3 w-3 ${(isActive && backendConnected) ? '' : 'opacity-50'}`}>
              {(isActive && backendConnected) && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${(isActive && backendConnected) ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{backendConnected ? 'Connected to Kyro Brain' : 'Offline / Backend Down'}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{isActive ? (backendConnected ? 'Capturing context in real-time' : 'Saving context locally') : 'Tracking paused by user'}</p>
            </div>
          </div>
        </div>

        {/* Hotkey Config Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Keyboard size={14} /> Capture Hotkey
            </h2>
          </div>
          <div className="glass-card rounded-lg p-3 border border-white/5 flex items-center justify-between group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div>
                <p className="text-sm font-medium text-white relative z-10">Manual Capture</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 relative z-10">Highlight text & press this to save</p>
             </div>
             <button
               onClick={() => setIsRecordingKeybind(true)}
               onKeyDown={isRecordingKeybind ? handleKeybindRecord : undefined}
               className={`relative z-10 px-3 py-1.5 rounded bg-black/40 border text-xs font-mono transition-all outline-none ${
                 isRecordingKeybind 
                   ? 'border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-pulse' 
                   : 'border-white/10 text-zinc-300 hover:border-white/20'
               }`}
             >
               {isRecordingKeybind ? 'Listening...' : captureKeybind}
             </button>
          </div>
        </div>

        {/* Privacy Controls Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield size={14} /> Privacy Controls
            </h2>
            <button
              onClick={toggleBlocklistMode}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                blocklistMode === 'block'
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title="Toggle between blocking listed domains or allowing only listed domains"
            >
              {blocklistMode === 'block' ? '🚫 Blocklist Mode' : '✅ Allowlist Mode'}
            </button>
          </div>

          <div className="glass-card rounded-lg p-3 border border-white/5 space-y-2">
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              {blocklistMode === 'block'
                ? 'Kyro will NOT capture from these domains.'
                : 'Kyro will ONLY capture from these domains.'}
            </p>

            {/* Input Row */}
            <div className="flex gap-2">
              <input
                type="text"
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBlocklistDomain()}
                placeholder="e.g. bankofamerica.com"
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                onClick={addBlocklistDomain}
                className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg border border-purple-500/30 transition-all"
                title="Add domain"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Domain List */}
            {blocklist.length > 0 ? (
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {blocklist.map(domain => (
                  <div key={domain} className="flex items-center justify-between bg-white/5 rounded-md px-3 py-1.5 group/domain">
                    <span className="text-xs text-zinc-300 font-mono truncate">{domain}</span>
                    <button
                      onClick={() => removeBlocklistDomain(domain)}
                      className="opacity-0 group-hover/domain:opacity-100 p-0.5 text-zinc-500 hover:text-red-400 transition-all ml-2 flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-600 text-center py-2">No domains added yet.</p>
            )}
          </div>
        </div>

        {/* Captures Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Database size={14} /> Recent Context
            </h2>
            <span className="text-[10px] text-zinc-500 font-medium">Last 1h</span>
          </div>

          <div className="space-y-2">
            {recentCaptures.slice(0, 5).map((item, i) => (
              <div key={i} onClick={() => window.open(item.url || '#', '_blank')} className="group/item glass-card rounded-lg p-3 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-colors">
                <div className="mt-0.5 bg-zinc-800/50 p-1.5 rounded-md border border-white/5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm text-zinc-200 font-medium truncate">{item.title}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{item.domain}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecentCaptures(prev => prev.filter((_, index) => index !== i));
                    if (item.id) fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/memory/${item.id}`, { method: 'DELETE' }).catch(() => {});
                  }}
                  className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-md transition-all"
                  title="Delete Memory"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {recentCaptures.length === 0 && (
              <div className="text-center py-4 text-xs text-zinc-500">
                No recent captures.
              </div>
            )}
          </div>
        </div>

        {/* Historical Sync Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Upload size={14} /> Historical Sync
            </h2>
          </div>
          
          <div className="glass-card rounded-lg p-4 border border-white/5 relative overflow-hidden">
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              Upload your ChatGPT <code className="bg-white/10 px-1 rounded">conversations.json</code> to backfill your knowledge graph.
            </p>
            <label className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white cursor-pointer transition-all">
              <Upload size={14} className="text-purple-400" />
              <span>Select File</span>
              <input 
                type="file" 
                accept=".json" 
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      if (Array.isArray(data)) {
                        let count = 0;
                        data.forEach((chat: any) => {
                          if (chat.title && chat.mapping) {
                            count++;
                            chrome.runtime.sendMessage({
                              type: "CAPTURE_CONTEXT",
                              data: {
                                url: "https://chatgpt.com/history",
                                title: chat.title,
                                text: `Historical Chat: ${chat.title}`,
                                domain: "chatgpt.com",
                                timestamp: new Date().toISOString()
                              }
                            });
                          }
                        });
                        alert(`Successfully queued ${count} historical conversations for processing!`);
                      }
                    } catch {
                      alert("Invalid JSON format.");
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-panel px-4 py-3 z-10 flex justify-between items-center border-t border-white/10 mt-auto rounded-t-xl">
        <div className="flex gap-2">
          <button 
            onClick={() => window.open(`${import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173'}/app/dashboard?tab=Settings`, '_blank')}
            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer" 
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button 
            onClick={() => {
              chrome.alarms.get("kyro-graph-prune", (alarm) => {
                if (alarm) {
                  setToastMessage(`Pruning Alarm active! Next trigger: ${new Date(alarm.scheduledTime).toLocaleTimeString()}`);
                } else {
                  setToastMessage('Pruning Alarm is not registered.');
                }
              });
            }}
            className="p-2 hover:bg-purple-500/10 rounded-lg text-purple-400 hover:text-purple-300 transition-colors" 
            title="Check Graph Pruning Alarm"
          >
            <Database size={16} />
          </button>
        </div>

        <a
          href={import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-all group"
        >
          Open Dashboard
          <ExternalLink size={12} className="text-zinc-400 group-hover:text-white transition-colors" />
        </a>
      </footer>
    </div>
  );
}

export default App;
