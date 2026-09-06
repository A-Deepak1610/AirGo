import React from 'react';
import { TrendingUp, Plane, Building2, Database, Clock } from 'lucide-react';

export const LiveMarketSnapshot = () => {
  const metrics = [
    {
      label: 'APIx Price Index',
      value: '118.40',
      delta: '+1.4% (24h)',
      deltaType: 'up',
      detail: 'Base 2024 = 100.0',
      icon: TrendingUp,
      accent: 'text-cyan-400'
    },
    {
      label: 'Routes Tracked',
      value: '80+',
      detail: 'Top 20 DGCA Trunk Corridors',
      delta: '82.4% Pax Vol',
      deltaType: 'neutral',
      icon: Plane,
      accent: 'text-blue-400'
    },
    {
      label: 'Airports Monitored',
      value: '25+',
      detail: 'Commercial Domestic Hubs',
      delta: 'National Grid',
      deltaType: 'neutral',
      icon: Building2,
      accent: 'text-purple-400'
    },
    {
      label: 'Data Sources',
      value: '8 Nodes',
      detail: 'Direct Airline TLS + OTAs',
      delta: '99.4% Uptime',
      deltaType: 'neutral',
      icon: Database,
      accent: 'text-emerald-400'
    },
    {
      label: 'Last Ingestion Sync',
      value: 'Today, 21:15',
      detail: 'Live 15m Continuous Interval',
      delta: '0.2% Error Rate',
      deltaType: 'neutral',
      icon: Clock,
      accent: 'text-slate-300'
    }
  ];

  return (
    <section className="bg-[#090D18] py-8 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              Live Market Snapshot
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            Aviation Economic Intelligence Feed · ISO Calibrated
          </span>
        </div>

        {/* 5-Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div 
                key={idx}
                className="bg-[#0D1527] border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                      {m.label}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${m.accent} opacity-80`} />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                      {m.value}
                    </span>
                    {m.delta && (
                      <span className={`text-[10px] font-mono font-bold ${
                        m.deltaType === 'up' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {m.delta}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 pt-2 mt-2 border-t border-slate-800/60 truncate">
                  {m.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
