import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const IndexIntroduction = () => {
  const navigate = useNavigate();

  return (
    <section id="index-concept" className="py-28 sm:py-36 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        
        {/* Typographic Header */}
        <div className="space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">
            THE MEASUREMENT BENCHMARK
          </span>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-none">
            AIRFARE PRICE INDEX
          </h2>

          <p className="text-2xl sm:text-3xl font-bold text-slate-700 max-w-2xl mx-auto pt-2">
            One number. Millions of fare observations.
          </p>

          <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed max-w-2xl mx-auto pt-2">
            A high-frequency measure designed to capture movements in domestic airfare prices across representative Indian routes and booking windows.
          </p>
        </div>

        {/* Minimalist Abstract Animated Golden Ratio Wave Line */}
        <div className="py-12 max-w-2xl mx-auto relative">
          <svg 
            className="w-full h-24 overflow-visible" 
            viewBox="0 0 600 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,50 Q75,10 150,50 T300,50 T450,20 T600,50"
              stroke="url(#indexWaveGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="indexWaveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 max-w-lg mx-auto pt-4">
            <span>Base 2024 = 100.0</span>
            <span>·</span>
            <span>Fisher Ideal Formula</span>
            <span>·</span>
            <span>Daily & Weekly Cadence</span>
          </div>
        </div>

        {/* Editorial Action Link to Feature Page */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/index-apix')}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer group"
          >
            <span>Examine the methodology and full calculations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
