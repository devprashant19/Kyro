import { motion } from 'framer-motion';
import { Database, Network, Search, Lightbulb } from 'lucide-react';
import GridBackground from '../components/GridBackground';

export default function HowItWorksPage() {
  return (
    <GridBackground>
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 flex flex-col">
        
        <div className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
              The Architecture
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mb-6 tracking-tight">
              How Kyro Works
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mx-auto">
              Kyro isn't just an app; it's a completely local context engine. We combine background data capture with powerful local graph databases to give you perfect recall of everything you've researched.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <StepCard 
            number="01"
            icon={<Database size={32} />}
            title="Local Storage"
            description="All your data is stored locally in SQLite and LanceDB. Your sensitive interactions are never sent to a cloud server, ensuring 100% privacy."
            delay={0.1}
          />
          <StepCard 
            number="02"
            icon={<Network size={32} />}
            title="Graph Structuring"
            description="Using Cognee, unstructured text from your AI prompts is transformed into a rich Knowledge Graph, connecting related concepts automatically."
            delay={0.2}
          />
          <StepCard 
            number="03"
            icon={<Search size={32} />}
            title="Semantic Search"
            description="When you ask a question on the dashboard, we perform a vector search combined with graph traversal to find the exact context you need."
            delay={0.3}
          />
          <StepCard 
            number="04"
            icon={<Lightbulb size={32} />}
            title="Insight Generation"
            description="By connecting dots across different sessions and days, Kyro can surface new insights and relationships you might have missed."
            delay={0.4}
          />
        </div>

        {/* Tech Stack Details */}
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">The Technology Stack</h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex-shrink-0 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-200 mb-2">Vector & Relational Storage</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Kyro leverages <strong className="text-blue-300 font-medium">PostgreSQL</strong> equipped with the <strong className="text-blue-300 font-medium">PGVector</strong> extension to store high-dimensional embeddings. This hybrid approach guarantees ACID compliance for structured relational data while unlocking lightning-fast semantic similarity search across your historical AI interactions.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex-shrink-0 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Network size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-200 mb-2">Cognee Knowledge Graph</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    At the heart of the engine runs the <strong className="text-purple-300 font-medium">Cognee</strong> graph framework. As the FastAPI backend receives raw text payloads, Cognee utilizes language models to identify distinct entities, cluster them, and draw permanent relational edges in a multidimensional local space.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex-shrink-0 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Search size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-200 mb-2">Local FastAPI Backend</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Unlike typical cloud-based AI tools, Kyro runs an asynchronous <strong className="text-indigo-300 font-medium">Python FastAPI</strong> server completely locally via Docker. It acts as the command center—receiving payloads from the browser extension, managing memory, and securely interfacing with Gemini's API keys configured securely in your local environment.
                  </p>
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
              <img src="/logo.png" alt="Kyro" className="w-5 h-5 object-contain" />
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

function StepCard({ number, icon, title, description, delay }: { number: string, icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors relative overflow-hidden"
    >
      <div className="absolute top-4 right-6 text-6xl font-black text-white/5 select-none pointer-events-none">
        {number}
      </div>
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{title}</h3>
      <p className="text-zinc-400 leading-relaxed relative z-10">
        {description}
      </p>
    </motion.div>
  );
}
