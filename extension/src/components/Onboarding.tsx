import { useState } from 'react';
import { CheckCircle2, Brain, Database, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const stepsData = [
    {
      icon: <Brain size={48} className="text-blue-500 mb-4" />,
      title: "Welcome to Kyro",
      description: "Kyro transforms your isolated chats into a unified, continuous memory system. Your AI that never forgets.",
      bullets: [
        "Create a continuous memory system",
        "Stop repeating yourself to AI",
        "Build a unified context graph"
      ]
    },
    {
      icon: <Database size={48} className="text-purple-500 mb-4" />,
      title: "Universal Memory Layer",
      description: "Share context seamlessly across different AI models without copy-pasting.",
      bullets: [
        "Works with ChatGPT",
        "Works with Claude",
        "Works with Perplexity & Gemini"
      ]
    },
    {
      icon: <Cpu size={48} className="text-blue-400 mb-4" />,
      title: "Smart Context Capture",
      description: "Automatically captures crucial information while you browse.",
      bullets: [
        "Track insights on GitHub",
        "Save context from Medium",
        "Capture notes from YouTube"
      ]
    },
    {
      icon: <ArrowRight size={48} className="text-purple-400 mb-4" />,
      title: "Intelligent Retrieval",
      description: "Surfaces relevant memories in a magical overlay directly inside your chat interface exactly when you need them.",
      bullets: [
        "Non-intrusive shadow UI",
        "Debounced smart search",
        "Click-to-inject control"
      ]
    },
    {
      icon: <ShieldCheck size={48} className="text-emerald-500 mb-4" />,
      title: "Privacy First",
      description: "Your memories are securely stored locally. You have full granular control.",
      bullets: [
        "Local-first storage architecture",
        "No unwanted auto-injections",
        "View or delete data anytime"
      ]
    },
    {
      icon: <CheckCircle2 size={56} className="text-emerald-500 mb-4" />,
      title: "Ready to Get Started?",
      description: "Make AI interactions more personalized and engaging while maintaining complete control over your privacy.",
      bullets: [
        "Quick & easy setup",
        "Free forever",
        "Start connecting today"
      ]
    }
  ];

  const currentData = stepsData[step - 1];

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white p-6 relative overflow-hidden">
      {/* Decorative ambient light */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 px-2">
        <div className="glass-card bg-zinc-900/40 border border-white/10 p-8 rounded-3xl w-full max-w-sm flex flex-col items-center shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
            {currentData.icon}
          </div>
          
          <h1 className="text-2xl font-bold mb-3 tracking-tight text-white">{currentData.title}</h1>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed text-center px-1">
            {currentData.description}
          </p>

          <ul className="flex flex-col items-center space-y-3 w-full">
            {currentData.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-center justify-center gap-2 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                <span className="text-center">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto w-full max-w-sm mx-auto z-10 space-y-6">
        {/* Dot Indicators */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === idx + 1 ? 'w-6 bg-blue-500' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Back
            </button>
          ) : (
            <button 
              onClick={onComplete}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-sm border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
            >
              Skip
            </button>
          )}
          
          <button 
            onClick={nextStep}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
          >
            {step === totalSteps ? 'Get Started' : 'Next'}
          </button>
        </div>

        <p className="text-center text-xs text-zinc-600 font-medium pb-2">
          Step {step} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
