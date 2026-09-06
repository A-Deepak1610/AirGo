import React from 'react';
import { ArrowRight, AlertCircle, Sparkles, Check, X } from 'lucide-react';

export const DataGapSection = () => {
  return (
    <section id="gap" className="py-24 sm:py-32 bg-white border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500">
            THE MEASUREMENT BLINDSPOT
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            But traditional collection sees only fragments.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            When prices fluctuate minute-by-minute across digital platforms, periodic manual surveys miss the true economic signal.
          </p>
        </div>

        {/* Visual Editorial Contrast (Left vs Right) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Left: Traditional Collection */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <span className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                  TRADITIONAL COLLECTION
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-mono font-semibold">
                  LEGACY
                </span>
              </div>

              <div className="mt-8 space-y-6">
                {[
                  { title: 'Limited observations', desc: 'Sampling a handful of counter quotes once a month.' },
                  { title: 'Manual collection', desc: 'Slow, labor-intensive enumerator data collection.' },
                  { title: 'Low frequency', desc: 'Monthly or quarterly reporting with 30–60 day publication lag.' },
                  { title: 'Static snapshots', desc: 'Ignores advance purchase windows, seat yield tiers, and flash sales.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 font-mono">
              Result: Policy decisions made on stale, incomplete pricing proxies.
            </div>
          </div>

          {/* Right: Real-World Airfare (Airfare Intelligence Platform) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <span className="text-xs font-mono font-bold tracking-wider text-blue-400 uppercase">
                  REAL-WORLD AIRFARE
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-semibold border border-blue-500/30">
                  REAL-TIME APIx
                </span>
              </div>

              <div className="mt-8 space-y-6">
                {[
                  { title: 'Dynamic', desc: 'Captures algorithmic price movements across intraday departure banks.' },
                  { title: 'Route-specific', desc: '100+ representative city-pairs weighted by DGCA passenger volume.' },
                  { title: 'Time-sensitive', desc: 'Continuous sampling across T+1, T+7, T+15, T+30, T+45 advance days.' },
                  { title: 'Online-first', desc: 'Direct ingestion from airline websites and travel aggregators at checkout.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-emerald-400 font-mono relative z-10">
              Result: An authoritative, high-frequency price signal that reflects consumer reality.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
