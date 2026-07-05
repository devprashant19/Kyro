import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, X, Globe, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import GridBackground from '../components/GridBackground';

const STORAGE_KEY = 'kyro_blocklist';
const MODE_KEY = 'kyro_blocklist_mode';

export default function PrivacyPage() {
  const [blocklist, setBlocklist] = useState<string[]>([]);
  const [mode, setMode] = useState<'block' | 'allow'>('block');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBlocklist(JSON.parse(stored));
      const storedMode = localStorage.getItem(MODE_KEY) as 'block' | 'allow' | null;
      if (storedMode) setMode(storedMode);
    } catch {
      // ignore parse errors
    }
  }, []);

  const persist = (list: string[], m: 'block' | 'allow') => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(MODE_KEY, m);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const normalizeDomain = (raw: string) => {
    return raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '');
  };

  const addDomain = () => {
    const domain = normalizeDomain(input);
    if (!domain) { setError('Enter a domain name.'); return; }
    if (!/\.[a-z]{2,}$/.test(domain)) { setError('Looks invalid — try something like "bankofamerica.com"'); return; }
    if (blocklist.includes(domain)) { setError('Already in the list.'); return; }
    const updated = [...blocklist, domain];
    setBlocklist(updated);
    persist(updated, mode);
    setInput('');
    setError('');
  };

  const removeDomain = (domain: string) => {
    const updated = blocklist.filter(d => d !== domain);
    setBlocklist(updated);
    persist(updated, mode);
  };

  const toggleMode = (newMode: 'block' | 'allow') => {
    setMode(newMode);
    persist(blocklist, newMode);
  };

  return (
    <GridBackground>
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Shield size={12} /> Privacy Controls
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Capture Blocklist</h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Control exactly which websites Kyro captures from. Changes are saved instantly and will be respected by the extension on your next capture.
          </p>
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm"
        >
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            This blocklist is stored in your browser. To have it take effect in the Chrome extension,
            reload the extension after making changes here. Cross-device sync via the backend is on the roadmap.
          </span>
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6 border border-white/5"
        >
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">List Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toggleMode('block')}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all ${
                mode === 'block'
                  ? 'bg-red-500/10 border-red-500/40 text-white shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className={mode === 'block' ? 'text-red-400' : 'text-zinc-500'} />
                <span className="font-semibold text-sm">Blocklist Mode</span>
              </div>
              <p className="text-xs text-zinc-400 text-left">Kyro captures everywhere <strong className="text-zinc-200">except</strong> these domains.</p>
            </button>
            <button
              onClick={() => toggleMode('allow')}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all ${
                mode === 'allow'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className={mode === 'allow' ? 'text-emerald-400' : 'text-zinc-500'} />
                <span className="font-semibold text-sm">Allowlist Mode</span>
              </div>
              <p className="text-xs text-zinc-400 text-left">Kyro captures <strong className="text-zinc-200">only</strong> from these domains.</p>
            </button>
          </div>
        </motion.div>

        {/* Add domain */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 border border-white/5"
        >
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Add a Domain</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && addDomain()}
                placeholder="e.g. bankofamerica.com"
                className="w-full pl-9 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 outline-none focus:border-purple-500/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
              />
            </div>
            <button
              onClick={addDomain}
              id="add-domain-btn"
              className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <Plus size={16} /> Add
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} /> {error}
            </p>
          )}
          {saved && (
            <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Saved!
            </p>
          )}
        </motion.div>

        {/* Domain list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
              {mode === 'block' ? 'Blocked Domains' : 'Allowed Domains'}
            </h2>
            <span className="text-xs text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              {blocklist.length} {blocklist.length === 1 ? 'domain' : 'domains'}
            </span>
          </div>

          {blocklist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
              <Globe size={36} className="mb-3 opacity-30" />
              <p className="text-sm">No domains added yet.</p>
              <p className="text-xs mt-1 opacity-60">Kyro is capturing from all websites.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {blocklist.map(domain => (
                  <motion.div
                    key={domain}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between bg-white/5 hover:bg-white/8 rounded-xl px-4 py-3 group border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mode === 'block' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      <span className="text-sm text-zinc-200 font-mono">{domain}</span>
                    </div>
                    <button
                      onClick={() => removeDomain(domain)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-all"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

      </div>
    </GridBackground>
  );
}
