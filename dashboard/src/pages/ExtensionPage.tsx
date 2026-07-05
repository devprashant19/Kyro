import { motion } from 'framer-motion';
import { Download, CheckCircle2, ShieldCheck, Zap, Globe, Code } from 'lucide-react';
import GridBackground from '../components/GridBackground';

export default function ExtensionPage() {
  return (
    <GridBackground>
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 flex flex-col">
        
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 md:p-12 border border-purple-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 transform translate-x-1/4 -translate-y-1/4">
              <Globe size={300} className="text-purple-400" />
            </div>
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest mb-6">
                Browser Extension
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                The Bridge to Your Brain
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                The Kyro extension runs silently in the background of your browser, capturing your interactions with various AI platforms and beaming them directly into your local Knowledge Graph.
              </p>
              
              <div className="flex items-center gap-4">
                <a 
                  href="/kyro-extension.zip"
                  download
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
                >
                  <Download size={18} /> Download Extension
                </a>
                <a 
                  href="https://github.com/puneetnith28/Kyro/tree/main/extension"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all border border-white/10 flex items-center gap-2"
                >
                  <Code size={18} /> GitHub
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <h2 className="text-xl font-bold text-white mb-6">Extension Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <FeatureCard 
            icon={<Globe size={24} />}
            title="Universal Compatibility"
            description="Kyro currently supports seamless interception on ChatGPT, Claude, and Google Gemini interfaces. It works entirely in the background without altering your normal workflow."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Zap size={24} />}
            title="Zero Latency Sync"
            description="Your prompts are instantly synced to your local FastAPI backend using lightweight background scripts, ensuring absolutely zero impact on your browsing speed."
            delay={0.2}
          />
          <FeatureCard 
            icon={<ShieldCheck size={24} />}
            title="100% Privacy Focused"
            description="The extension is fully open-source. It does not send analytics, tracking data, or your prompts to any third-party cloud. Your data is strictly sent to localhost."
            delay={0.3}
          />
          <FeatureCard 
            icon={<CheckCircle2 size={24} />}
            title="Auto-categorization"
            description="The extension tags incoming data with metadata like source URL, timestamp, and active AI model before routing it to the Cognee graph engine."
            delay={0.4}
          />
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

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
