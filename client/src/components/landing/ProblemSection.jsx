import React from 'react';
import { TrendingUp, Globe, Clock, AlertTriangle, ArrowUpRight, Cpu } from 'lucide-react';

export const ProblemSection = () => {
  const problems = [
    {
      id: 'dynamic-pricing',
      title: 'Dynamic Pricing',
      description: 'The same route can experience significant price variation throughout a single day based on real-time load factors and algorithmic repricing.',
      icon: TrendingUp,
      stat: '4–8x',
      statLabel: 'Intraday price swings on trunk routes'
    },
    {
      id: 'online-booking',
      title: 'Online-First Booking',
      description: 'Most domestic tickets are now purchased through airline websites and online travel aggregators with dynamic ancillary fees and varying gateway surcharges.',
      icon: Globe,
      stat: '92%+',
      statLabel: 'Share of domestic bookings made online'
    },
    {
      id: 'manual-collection',
      title: 'Manual Collection',
      description: 'Traditional collection methods struggle to capture high-frequency, route-specific pricing, missing critical weekend surges and short-notice spikes.',
      icon: Clock,
      stat: '30 Days',
      statLabel: 'Typical lag in official statistics'
    },
    {
      id: 'missing-signal',
      title: 'Missing Signal',
      description: 'Policy makers and central bank economists need a high-frequency data source that reflects the actual prices consumers encounter at point-of-sale.',
      icon: AlertTriangle,
      stat: '100+ Routes',
      statLabel: 'Required for national price coverage'
    }
  ];

  return (
    <section id="problem" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>THE CHALLENGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Airfare pricing changes faster than traditional data collection.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Standard monthly price sampling creates blind spots during seasonal demand surges, festive travel peaks, and sudden aviation supply shocks.
          </p>
        </div>

        {/* 4 Compact Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs hover:shadow-md transition-all hover:border-blue-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-5">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 font-normal leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {p.stat}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {p.statLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
