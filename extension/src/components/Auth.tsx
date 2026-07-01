import { ExternalLink } from 'lucide-react';
import { SignIn } from '@clerk/chrome-extension';

interface AuthProps {
  onComplete: () => void;
}

export function Auth({ onComplete }: AuthProps) {
  const openSignUp = () => {
    window.open('http://localhost:5173/sign-up', '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-white p-6 relative overflow-y-auto justify-center items-center">
      {/* Decorative ambient light */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-sm z-10 flex flex-col items-center">
        <SignIn routing="hash" />
      </div>

      <div className="mt-8 z-10 flex flex-col items-center">
        <p className="text-zinc-400 text-sm mb-3">Don't have an account?</p>
        <button 
          onClick={openSignUp}
          className="flex items-center gap-2 py-2 px-4 rounded-xl font-medium text-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Sign up on Dashboard <ExternalLink size={14} />
        </button>
      </div>

      {/* Hidden button for dev testing if needed to skip auth */}
      <button 
        onClick={onComplete}
        className="absolute bottom-4 right-4 opacity-10 hover:opacity-100 text-xs text-zinc-500"
      >
        Skip (Dev)
      </button>
    </div>
  );
}
