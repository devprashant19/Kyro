import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Blocks, Sparkles, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GridBackground from '../components/GridBackground';

export default function AppHome() {
  const navigate = useNavigate();

  return (
    <GridBackground>
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Personal Workspace
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mb-6 tracking-tight">
            Welcome back, Jane
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light mb-8">
            Your context OS is running perfectly. Kyro has been silently synthesizing your research across platforms into a unified knowledge graph.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/app/dashboard')}
              className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} />
              Open Dashboard
            </button>
            <button 
              onClick={() => navigate('/app/extension')}
              className="px-6 py-3 bg-zinc-900 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Blocks size={18} />
              Manage Extension
            </button>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
              <BrainCircuit size={100} className="text-blue-400" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Context Aware</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Kyro automatically understands the context of your workflow, linking concepts from your ChatGPT and Claude sessions without manual entry.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-colors relative overflow-hidden group md:col-span-2"
          >
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest mb-6">
                  Integration
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">The Kyro Extension</h3>
                <p className="text-zinc-400 text-base leading-relaxed max-w-lg mb-8">
                  The magic happens through the browser extension. It silently observes your AI interactions and securely streams the knowledge to your local database, building your personal brain.
                </p>
              </div>
              <div>
                <button 
                  onClick={() => navigate('/app/how-it-works')}
                  className="group/btn inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  Learn how it works 
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Start Guide Section */}
        <div className="w-full mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Quick Start Guide</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-2xl border border-white/5 relative"
            >
              <div className="text-4xl font-black text-white/5 absolute top-4 right-4">1</div>
              <h4 className="text-lg font-bold text-white mb-2">Install Extension</h4>
              <p className="text-sm text-zinc-400 mb-4">Download and load the unpacked extension in Chrome to enable browser-level prompt interception.</p>
              <button onClick={() => navigate('/app/extension')} className="text-blue-400 text-sm font-semibold hover:text-blue-300">Get Extension &rarr;</button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 rounded-2xl border border-white/5 relative"
            >
              <div className="text-4xl font-black text-white/5 absolute top-4 right-4">2</div>
              <h4 className="text-lg font-bold text-white mb-2">Start Backend</h4>
              <p className="text-sm text-zinc-400 mb-4">Run the FastAPI server via Docker Compose to spin up your Postgres vector database and RAG engine.</p>
              <button onClick={() => navigate('/app/how-it-works')} className="text-purple-400 text-sm font-semibold hover:text-purple-300">View Architecture &rarr;</button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 rounded-2xl border border-white/5 relative"
            >
              <div className="text-4xl font-black text-white/5 absolute top-4 right-4">3</div>
              <h4 className="text-lg font-bold text-white mb-2">Use Normally</h4>
              <p className="text-sm text-zinc-400 mb-4">Use ChatGPT, Claude, or Gemini as usual. Open the Kyro Dashboard to see your memories populate in real-time.</p>
              <button onClick={() => navigate('/app/dashboard')} className="text-indigo-400 text-sm font-semibold hover:text-indigo-300">Open Dashboard &rarr;</button>
            </motion.div>
          </div>
        </div>

        {/* System Status Mock */}
        <div className="w-full mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Local System Status</h3>
              <p className="text-zinc-400 text-sm max-w-md">Your local memory engine is fully operational. All intercepted knowledge is being securely routed to your isolated environment.</p>
            </div>
            
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-white mb-1">Active</div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  FastAPI Server
                </div>
              </div>
              
              <div className="w-px h-12 bg-white/10 hidden md:block"></div>
              
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-white mb-1">Connected</div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  PGVector DB
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 pt-12 pb-8 px-8 text-sm w-full bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 shadow-md border border-white/10 flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400 text-sm font-bold">K</span>
            </div>
            <span className="font-bold text-white text-xl tracking-tight">Kyro</span>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 border-dashed text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Kyro. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="https://github.com/puneetnith28/Kyro" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.37 4.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </GridBackground>
  );
}
