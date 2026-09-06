import React from 'react';
import { ShieldCheck, Check, Lock, Cpu, Clock, RefreshCw, Layers } from 'lucide-react';

export const DataSourcesSection = () => {
  const airlines = [
    { name: 'IndiGo', code: '6E', share: '62.4% Domestic Market', type: 'Airline' },
    { name: 'Air India', code: 'AI', share: '14.2% Full Service', type: 'Airline' },
    { name: 'Air India Express', code: 'IX', share: '7.1% Budget Trunk', type: 'Airline' },
    { name: 'Akasa Air', code: 'QP', share: '5.2% Modern Fleet', type: 'Airline' },
    { name: 'SpiceJet', code: 'SG', share: '4.3% Regional Focus', type: 'Airline' }
  ];

  const otas = [
    { name: 'MakeMyTrip', type: 'OTA', tag: 'Primary Aggregator', feeNote: '₹299-₹399 Convenience' },
    { name: 'Yatra', type: 'OTA', tag: 'Corporate & Leisure', feeNote: '₹250-₹350 Convenience' },
    { name: 'EaseMyTrip', type: 'OTA', tag: 'Zero Convenience Promo', feeNote: '₹0-₹99 Convenience' },
    { name: 'Cleartrip', type: 'OTA', tag: 'Flipkart Travel Ecosystem', feeNote: '₹300 Convenience' },
    { name: 'Ixigo', type: 'OTA', tag: 'Tier 2/3 Search Leader', feeNote: '₹270 Convenience' },
    { name: 'Goibibo', type: 'OTA', tag: 'Consumer Budget Travel', feeNote: '₹299 Convenience' }
  ];

  const ethicalSafeguards = [
    { title: 'robots.txt aware', desc: 'Strict compliance with crawler directives and disallow rules on all source endpoints.' },
    { title: 'rate limited', desc: 'Randomized 2.5s - 6.0s jitter delays to avoid any server load or consumer degradation.' },
    { title: 'session controlled', desc: 'Transient browser sessions with automatic cookie rotation and zero credential storage.' },
    { title: 'compliant collection', desc: 'Read-only flight search inspection without booking creation or cart reservation.' },
    { title: 'deduplicated data', desc: 'Cryptographic SHA-256 flight signature hashing eliminating double-counted inventory.' }
  ];

  return (
    <section id="sources" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>COMPREHENSIVE COVERAGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            One index. Multiple sources.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Continuously ingesting and reconciling price quotes across both scheduled carrier engines and dominant online travel aggregators.
          </p>
        </div>

        {/* Sources Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Airlines & OTAs Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Direct Airline Engines */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <span>Scheduled Domestic Airlines (Direct Carrier Inventory)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {airlines.map((a) => (
                  <div 
                    key={a.name}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-400 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-600">
                      <span>{a.code}</span>
                      <span className="text-slate-400 font-normal">{a.type}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-1">
                      {a.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {a.share}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Travel Aggregators */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <span>Online Travel Aggregators (OTA Convenience Fee Spreads)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {otas.map((o) => (
                  <div 
                    key={o.name}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-400 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-indigo-600 font-semibold">
                      <span>{o.type}</span>
                      <span className="text-[10px] text-slate-400">{o.feeNote}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-1">
                      {o.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {o.tag}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Ethical Data Collection Card (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-emerald-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-base font-bold tracking-tight text-white">
                  Ethical Data Collection
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-5">
                Our autonomous collection agents operate with rigorous governance standards to preserve public server integrity and adhere to ethical research protocols.
              </p>

              <div className="space-y-3.5">
                {ethicalSafeguards.map((s) => (
                  <div key={s.title} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-semibold text-slate-200">
                        {s.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {s.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Robots Standard v2.0</span>
              <span className="text-emerald-400 font-semibold">100% Policy Compliant</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
