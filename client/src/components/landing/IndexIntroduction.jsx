import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

export const IndexIntroduction = () => {
  const navigate = useNavigate();
  const [cadence, setCadence] = useState('daily');

  const cadences = {
    daily: { label: 'Daily Spot Index', value: '128.6', change: '+3.84%', note: '24-hour intraday weighted census' },
    weekly: { label: 'Weekly Moving Index', value: '124.2', change: '+2.15%', note: '7-day smoothed trendline' },
    monthly: { label: 'Monthly National Benchmark', value: '119.8', change: '+1.40%', note: 'DGCA passenger traffic weighted' }
  };

  const active = cadences[cadence];

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

        {/* Minimalist Interactive Index Model Card */}
        <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          {/* Cadence Selector Tabs */}
          <div className="flex items-center justify-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-mono">
            {Object.keys(cadences).map((k) => (
              <button
                key={k}
                onClick={() => setCadence(k)}
                className={`px-3 py-1.5 rounded-xl transition-all capitalize cursor-pointer ${
                  cadence === k 
                    ? 'bg-white text-slate-900 font-bold shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Large Clean Readout */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900">
              {active.value}
            </span>
            <div className="text-left">
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                {active.change}
              </span>
              <span className="block text-[11px] text-slate-400 font-mono mt-1">
                Base 2024 = 100.0
              </span>
            </div>
          </div>

          {/* Harmonic Waveform SVG */}
          <div className="py-2">
            <svg 
              className="w-full h-16 overflow-visible" 
              viewBox="0 0 500 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,40 C100,10 150,70 250,35 C350,5 400,65 500,40"
                stroke="url(#indexWaveGrad)"
                strokeWidth="3.0"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="indexWaveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-100 pt-3">
            <span>{active.label}</span>
            <span>{active.note}</span>
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
