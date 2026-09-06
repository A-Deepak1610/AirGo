import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { IndiaNetworkMap } from './IndiaNetworkMap';

export const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-800/80 bg-[#080C14]">
      {/* Background ambient technical glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                SIH26056 · Live Econometric Airfare Index
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-sans">
              India's Airfare Market,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                Measured in Real Time.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal max-w-xl">
              Track dynamic airfare movements across India's domestic aviation network through automated data collection, component-level normalization, and econometric price intelligence.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/index-apix')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer"
              >
                <span>Explore Airfare Index</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('methodology');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/backtesting');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>View Methodology</span>
              </button>
            </div>

            {/* Technical Verification Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-3 text-left border-t border-slate-800/80 max-w-lg font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Sampling Model</span>
                <span className="text-xs font-bold text-slate-300">DGCA Basket</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Index Formulation</span>
                <span className="text-xs font-bold text-cyan-400">Laspeyres / Fisher</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Outlier Rejection</span>
                <span className="text-xs font-bold text-slate-300">1.5× IQR Fence</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Network Map Preview */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Floating Live Indicator Badge */}
              <div className="absolute -top-3 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0B1120] border border-cyan-500/40 text-xs font-mono font-bold text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>APIx: 118.40</span>
                <span className="text-emerald-400 text-[10px]">+1.4% (24h)</span>
              </div>

              {/* Map Canvas Card */}
              <IndiaNetworkMap compact={true} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
