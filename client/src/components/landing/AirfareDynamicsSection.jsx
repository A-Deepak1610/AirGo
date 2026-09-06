import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';
import { Clock } from 'lucide-react';

export const AirfareDynamicsSection = () => {
  const [activeWindow, setActiveWindow] = useState('T+1');

  // Lead-time elasticity data from T+45 to T+1
  const leadTimeData = [
    { window: 'T+45', leadDays: 45, fare: 4210, surgeMultiplier: '1.0x', category: 'Baseline Inventory', share: '10%' },
    { window: 'T+30', leadDays: 30, fare: 4680, surgeMultiplier: '1.11x', category: 'Early Leisure', share: '16%' },
    { window: 'T+15', leadDays: 15, fare: 5540, surgeMultiplier: '1.32x', category: 'Mid-Lead Standard', share: '32%' },
    { window: 'T+7', leadDays: 7, fare: 6720, surgeMultiplier: '1.60x', category: 'Weekly Business', share: '24%' },
    { window: 'T+1', leadDays: 1, fare: 8450, surgeMultiplier: '2.01x', category: 'Urgent Same-Day', share: '18%' }
  ];

  // Daily index progression data
  const timeSeriesData = [
    { date: 'Aug 01', headlineIndex: 114.2, t1Surge: 121.0, t45Base: 102.5 },
    { date: 'Aug 06', headlineIndex: 115.0, t1Surge: 122.8, t45Base: 102.8 },
    { date: 'Aug 11', headlineIndex: 116.8, t1Surge: 125.4, t45Base: 103.1 },
    { date: 'Aug 16', headlineIndex: 116.2, t1Surge: 123.5, t45Base: 103.0 },
    { date: 'Aug 21', headlineIndex: 117.5, t1Surge: 126.2, t45Base: 103.4 },
    { date: 'Aug 26', headlineIndex: 118.0, t1Surge: 127.1, t45Base: 103.6 },
    { date: 'Aug 31', headlineIndex: 118.4, t1Surge: 128.0, t45Base: 103.8 }
  ];

  const selectedWinObj = leadTimeData.find(d => d.window === activeWindow) || leadTimeData[4];

  return (
    <section className="py-16 sm:py-20 bg-[#080C14] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Temporal Airfare Dynamics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans">
              Airfares Move. The Index Captures It.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Airline dynamic pricing algorithms react exponentially as departure approaches. Standardized advance purchase windows isolate genuine inflation from urgency premiums.
            </p>
          </div>

          {/* Temporal Window Selector Pills */}
          <div className="flex items-center gap-1.5 bg-[#0D1527] border border-slate-800 p-1 rounded-xl text-xs font-mono">
            {leadTimeData.map((w) => (
              <button
                key={w.window}
                onClick={() => setActiveWindow(w.window)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  activeWindow === w.window
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {w.window}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Analytics Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Advance Booking Window Elasticity Curve (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0B1120] border border-slate-800/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-white">
                  Lead-Time Pricing Curve (DEL ↔ BOM Trunk)
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Average observed total fare across T+45 to T+1 advance departure horizons
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-cyan-300">
                2.01× Surge Elasticity
              </span>
            </div>

            {/* Recharts Area Curve */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadTimeData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="curveGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="window" 
                    stroke="#64748B" 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    stroke="#64748B" 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                    domain={[3000, 9500]}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0D1527] border border-cyan-500/50 rounded-lg p-2.5 shadow-xl text-xs font-mono">
                            <span className="text-cyan-400 font-bold block">{data.window} ({data.category})</span>
                            <span className="text-white font-black text-sm block mt-0.5">₹{data.fare.toLocaleString()}</span>
                            <span className="text-amber-400 text-[10px] block">Surge: {data.surgeMultiplier}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="fare"
                    stroke="#06B6D4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#curveGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Horizon Metric Strip */}
            <div className="grid grid-cols-5 gap-2 pt-3 border-t border-slate-800/80 text-center font-mono">
              {leadTimeData.map((d) => (
                <div 
                  key={d.window}
                  className={`p-2 rounded-lg border transition-all ${
                    activeWindow === d.window
                      ? 'bg-cyan-500/10 border-cyan-500/40'
                      : 'bg-slate-900/40 border-slate-800/60'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block">{d.window}</span>
                  <span className="text-xs font-bold text-white block">₹{d.fare}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Selected Horizon Deep-Dive & Trajectory (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Selected Horizon Card */}
            <div className="bg-[#0B1120] border border-cyan-500/30 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">Active Horizon</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                  {selectedWinObj.window} Horizon
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  ₹{selectedWinObj.fare.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-cyan-400 font-semibold">
                  {selectedWinObj.category} · {selectedWinObj.surgeMultiplier} of Base Tariff
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Represents <span className="text-slate-200 font-bold">{selectedWinObj.share}</span> of total observed domestic booking transactions according to historical empirical ticket purchase curves.
              </p>
            </div>

            {/* 30-Day Index Convergence Comparison */}
            <div className="bg-[#0B1120] border border-slate-800/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-white">Index Series Trajectory</span>
                <span className="text-[10px] font-mono text-slate-400">August 2026 Daily Track</span>
              </div>

              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis domain={[100, 130]} stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#0D1527] border border-slate-700 rounded p-2 text-[10px] font-mono text-white">
                              <div>Headline APIx: {payload[0]?.value}</div>
                              <div className="text-amber-400">T+1 Surge: {payload[1]?.value}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line type="monotone" dataKey="headlineIndex" stroke="#06B6D4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="t1Surge" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-cyan-400"></span>
                  <span>Headline APIx (118.4)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-amber-400"></span>
                  <span>T+1 Urgent Track (128.0)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
