import { useState } from 'react'

function App() {
  const [isActive, setIsActive] = useState(true)

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white p-4 font-sans border border-zinc-800 rounded-lg">
      <header className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center font-bold text-xs">K</div>
          <h1 className="text-lg font-semibold tracking-tight">Kyro</h1>
        </div>
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${isActive ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
        >
          {isActive ? 'Tracking Active' : 'Paused'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto py-4 space-y-4">
        <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800/50 shadow-sm">
          <h2 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Recent Captures</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-zinc-300 bg-black/40 p-2 rounded border border-white/5">
              <span className="text-blue-400 mt-0.5">●</span>
              <span>GitHub: Cognee Architecture Repository</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-zinc-300 bg-black/40 p-2 rounded border border-white/5">
              <span className="text-green-400 mt-0.5">●</span>
              <span>Medium: "Vector Databases Explained"</span>
            </li>
          </ul>
        </div>

        <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800/50">
          <h2 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Connection Status</h2>
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Connected to Kyro Brain (Local)
          </div>
        </div>
      </main>

      <footer className="pt-4 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
        <span>v1.0.0</span>
        <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-white transition-colors">
          Open Dashboard ↗
        </a>
      </footer>
    </div>
  )
}

export default App
