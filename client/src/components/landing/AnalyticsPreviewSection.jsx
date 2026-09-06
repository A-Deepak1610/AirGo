import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, Activity, Layers, ArrowRight } from 'lucide-react';

export const AnalyticsPreviewSection = () => {
  const navigate = useNavigate();

  // Illustrative preview data
  const trendData = [
    { date: 'Aug 01', APIx: 114.2, DGCA: 100.0 },
    { date: 'Aug 08', APIx: 115.8, DGCA: 100.0 },
    { date: 'Aug 15', APIx: 116.4, DGCA: 100.0 },
    { date: 'Aug 22', APIx: 117.2, DGCA: 100.0 },
    { date: 'Aug 29', APIx: 118.0, DGCA: 100.0 },
    { date: 'Aug 31', APIx: 118.4, DGCA: 100.0 }
  ];

  const sectorPressure = [
    { corridor: 'DEL ↔ BOM', shift: '+3.8%', fare: '₹8,450', status: 'Surge Alert', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { corridor: 'BLR ↔ DEL', shift: '+2.4%', fare: '₹6,890', status: 'Moderate', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { corridor: 'BOM ↔ BLR', shift: '+1.8%', fare: '₹5,850', status: 'Moderate', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { corridor: 'DEL ↔ HYD', shift: '+0.6%', fare: '₹5,750', status: 'Stable', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { corridor: 'CCU ↔ DEL', shift: '-0.4%', fare: '₹6,150', status: 'Normal', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { corridor: 'BLR ↔ MAA', shift: '+0.2%', fare: '₹3,200', status: 'Stable', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
  ];

  const elasticityData = [
    { window: 'T+45', fare: 4210 },
    { window: 'T+30', fare: 4680 },
    { window: 'T+15', fare: 5540 },
    { window: 'T+7', fare: 6720 },
    { window: 'T+1', fare: 8450 }
  ];

  return (
    <section id="platform" className="py-16 sm:py-20 bg-[#080C14] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              <span>Platform Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans">
              Real-Time Analytical Modules
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Live previews of analytical engines deployed within the AirGo operational platform for econometric tracking and route intelligence.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <span>Open Interactive Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Analytics Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel 1: Price Trends */}
          <div className="bg-[#0B1120] border border-slate-800/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                    1. Price Trends (APIx)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">Base 2024 = 100.0</span>
              </div>

              <div className="py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-white">118.40</span>
                  <span className="text-xs font-mono font-bold text-amber-400">+1.4% (24h)</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Laspeyres fixed-weight index across 20 monitored trunk corridors
                </p>
              </div>

              {/* Chart Preview */}
              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis domain={[95, 125]} stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }} />
                    <Area type="monotone" dataKey="APIx" stroke="#06B6D4" strokeWidth={2} fill="url(#trendGlow)" />
                    <Line type="monotone" dataKey="DGCA" stroke="#64748B" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button
              onClick={() => navigate('/index-apix')}
              className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Explore Index Formulations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Panel 2: Sector Heatmap */}
          <div className="bg-[#0B1120] border border-slate-800/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                    2. Sector Price Heatmap
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Live Spreads</span>
              </div>

              <div className="py-2">
                <span className="text-xs font-mono text-slate-300 font-bold block">
                  Corridor Price Pressure & Inflation Shifts
                </span>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Real-time yield fluctuations vs monthly baseline tariffs
                </p>
              </div>

              {/* Table Preview */}
              <div className="space-y-1.5 pt-1">
                {sectorPressure.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono"
                  >
                    <span className="font-bold text-slate-200">{s.corridor}</span>
                    <span className="text-slate-400">{s.fare}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${s.color}`}>
                      {s.shift}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/analytics')}
              className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>View Full National Heatmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Panel 3: Lead-Time Elasticity */}
          <div className="bg-[#0B1120] border border-slate-800/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                    3. Lead-Time Elasticity
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">T+1 to T+45</span>
              </div>

              <div className="py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-white">2.01×</span>
                  <span className="text-xs font-mono font-bold text-amber-400">T+1 Urgent Surge</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Dynamic price escalation curve from base inventory to same-day departure
                </p>
              </div>

              {/* Chart Preview */}
              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={elasticityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="elasticityGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="window" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis domain={[3500, 9000]} stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }} />
                    <Area type="monotone" dataKey="fare" stroke="#10B981" strokeWidth={2} fill="url(#elasticityGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button
              onClick={() => navigate('/analytics')}
              className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Explore Corridor Elasticity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
