import { LogIn } from 'lucide-react';

interface AuthProps {
  onComplete: () => void;
}

export function Auth({ onComplete }: AuthProps) {
  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white p-6 relative overflow-hidden justify-center items-center">
      {/* Decorative ambient light */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 mb-6 shadow-xl">
        <LogIn size={40} className="text-blue-400" />
      </div>
      
      <h1 className="text-xl font-bold mb-2">Authentication Required</h1>
      <p className="text-center text-zinc-400 text-sm mb-8 px-4 leading-relaxed">
        This is a placeholder for the authentication system. We will implement Clerk or OAuth here in the next step.
      </p>

      <button 
        onClick={onComplete}
        className="w-full max-w-[200px] py-3 px-4 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
      >
        Skip Auth (Dev)
      </button>
    </div>
  );
}
