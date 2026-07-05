import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Network, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import GridBackground from '../components/GridBackground';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <GridBackground>
      {/* Decorative ambient light */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-10 w-full flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 font-bold text-white text-xl tracking-tight group cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 shadow-md border border-white/10">
              <img src="/logo.png" alt="Kyro" className="w-6 h-6 object-contain" />
            </div>
          </div>
          Kyro
        </div>
        <div className="flex items-center gap-4">
          <Link to="/sign-in" className="text-zinc-400 hover:text-white font-medium transition-colors text-sm">
            Sign In
          </Link>
          <Link to="/sign-up" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center max-w-5xl mx-auto">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-zinc-400 mb-8 tracking-tight leading-tight"
        >
          The AI That Never <br /> Forgets You.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-zinc-400 text-xl md:text-2xl leading-relaxed font-light mb-12 max-w-3xl"
        >
          Kyro silently captures the context of your digital life—intercepting your thoughts across AI platforms—weaving them into a continuous, local memory graph.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button onClick={() => navigate('/sign-up')} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 text-lg">
            Start Building Your Brain <ArrowRight size={20} />
          </button>
          <button onClick={() => window.open('https://github.com/puneetnith28/Kyro')} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 text-lg">
            View Documentation
          </button>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <Clock size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Universal Tracking</h3>
            <p className="text-zinc-400 leading-relaxed">
              Runs silently in the background, intercepting your prompts from all major AI platforms before they are sent, capturing your raw train of thought.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Network size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Knowledge Graph</h3>
            <p className="text-zinc-400 leading-relaxed">
              Captured context is fed into a local RAG engine. Entities and relationships are extracted to build a 3D structural graph of your knowledge.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Contextual RAG</h3>
            <p className="text-zinc-400 leading-relaxed">
              Query your own history. Ask Kyro questions and it will retrieve exactly what you were researching days ago to answer you perfectly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 pt-12 pb-8 px-8 text-sm">
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
