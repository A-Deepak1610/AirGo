import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { TrendingUp, ArrowUpRight, BarChart3, PieChart, Layers, ShieldCheck, Download } from 'lucide-react';

const INDEX_SERIES = {
  Daily: [
    { date: 'Aug 01', apix: 122.4, ma7: 121.8, baseline: 100 },
    { date: 'Aug 05', apix: 123.8, ma7: 122.5, baseline: 100 },
    { date: 'Aug 10', apix: 125.1, ma7: 124.0, baseline: 100 },
    { date: 'Aug 15', apix: 129.4, ma7: 126.2, baseline: 100 }, // Independence Day surge
    { date: 'Aug 20', apix: 126.8, ma7: 127.1, baseline: 100 },
    { date: 'Aug 25', apix: 127.5, ma7: 127.3, baseline: 100 },
    { date: 'Aug 30', apix: 128.6, ma7: 127.9, baseline: 100 }
  ],
  Weekly: [
    { date: 'W28 (Jul)', apix: 119.2, ma7: 118.5, baseline: 100 },
    { date: 'W29 (Jul)', apix: 121.0, ma7: 120.1, baseline: 100 },
    { date: 'W30 (Jul)', apix: 122.8, ma7: 121.4, baseline: 100 },
    { date: 'W31 (Aug)', apix: 124.5, ma7: 123.2, baseline: 100 },
    { date: 'W32 (Aug)', apix: 127.2, ma7: 125.0, baseline: 100 },
    { date: 'W33 (Aug)', apix: 128.6, ma7: 126.8, baseline: 100 }
  ],
  Monthly: [
    { date: 'Mar 2026', apix: 112.4, ma7: 111.0, baseline: 100 },
    { date: 'Apr 2026', apix: 115.8, ma7: 114.2, baseline: 100 },
    { date: 'May 2026', apix: 121.4, ma7: 118.6, baseline: 100 },
    { date: 'Jun 2026', apix: 124.0, ma7: 121.5, baseline: 100 },
    { date: 'Jul 2026', apix: 123.9, ma7: 123.0, baseline: 100 },
    { date: 'Aug 2026', apix: 128.6, ma7: 125.5, baseline: 100 }
  ]
};

const ROUTE_CONTRIBUTIONS = [
  { route: 'DEL-BOM', contribution: '+1.42%', weight: '5.85%', fare: '₹5,940' },
  { route: 'DEL-SXR', contribution: '+0.88%', weight: '1.54%', fare: '₹6,890' },
  { route: 'BLR-DEL', contribution: '+0.65%', weight: '4.00%', fare: '₹6,420' },
  { route: 'CCU-DEL', contribution: '+0.52%', weight: '2.37%', fare: '₹5,850' },
  { route: 'DEL-PNQ', contribution: '+0.37%', weight: '2.50%', fare: '₹5,680' }
];

const CARRIER_INDICES = [
  { carrier: 'Air India', index: 131.2, mom: '+4.8%', share: '14.2%' },
  { carrier: 'IndiGo', index: 127.8, mom: '+3.6%', share: '62.4%' },
  { carrier: 'SpiceJet', index: 126.4, mom: '+4.1%', share: '4.3%' },
  { carrier: 'Akasa Air', index: 121.5, mom: '+1.9%', share: '5.2%' }
];

const FARE_DISTRIBUTION = [
  { range: '₹2k-4k', pct: 14 },
  { range: '₹4k-6k', pct: 42 },
  { range: '₹6k-8k', pct: 26 },
  { range: '₹8k-10k', pct: 12 },
  { range: '>₹10k', pct: 6 }
];

export const IndexSection = () => {
  const [frequency, setFrequency] = useState('Daily');
  const [activeTab, setActiveTab] = useState('trend'); // 'trend' | 'route' | 'carrier' | 'distribution'

  const currentSeries = INDEX_SERIES[frequency];

  return (
    <section id="index" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>INSTITUTIONAL PRICE SIGNAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            A price index built for real-world airfare dynamics.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            APIx synthesizes high-frequency quote observations across advance booking horizons and route traffic weights using the Fisher Ideal Index methodology.
          </p>
        </div>

        {/* Financial Terminal Container */}
        <div className="mt-12 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8">
          
          {/* Top Headline Telemetry Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
                  NATIONAL AIRFARE PRICE INDEX (APIx)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  BASE: 2024 = 100.0
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-4">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white tabular-nums">
                  128.6
                </span>
                <div>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                    +3.84%
                  </span>
                  <span className="block text-xs text-slate-400">
                    vs previous period
                  </span>
                </div>
              </div>
            </div>

            {/* Frequency Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 self-start lg:self-auto text-xs font-medium">
              {['Daily', 'Weekly', 'Monthly'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`px-4 py-2 rounded-lg font-mono transition-all cursor-pointer ${
                    frequency === f
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Tabs: Index Trend | Route Contribution | Carrier Contribution | Fare Distribution */}
          <div className="mt-6 flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
            {[
              { id: 'trend', label: 'Index Trend' },
              { id: 'route', label: 'Route Contribution' },
              { id: 'carrier', label: 'Carrier Contribution' },
              { id: 'distribution', label: 'Fare Distribution' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="mt-6">
            
            {/* 1. Index Trend Chart */}
            {activeTab === 'trend' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-blue-500 rounded-full"></span>
                      <span>APIx Headline</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-amber-400 rounded-full"></span>
                      <span>7-Day Moving Avg</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-t border-dashed border-slate-500"></span>
                      <span>Base 100.0</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px]">Fisher Ideal Formula</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis domain={[95, 135]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="apix" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8' }} />
                      <Line type="monotone" dataKey="ma7" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeWidth={1} strokeDasharray="2 2" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 2. Route Contribution Table */}
            {activeTab === 'route' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="py-2.5 px-3">Corridor</th>
                      <th className="py-2.5 px-3 font-mono">DGCA Traffic Weight</th>
                      <th className="py-2.5 px-3 font-mono">Current Avg Fare</th>
                      <th className="py-2.5 px-3 font-mono text-right">Headline Index Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {ROUTE_CONTRIBUTIONS.map((r) => (
                      <tr key={r.route} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-blue-400">{r.route}</td>
                        <td className="py-3 px-3">{r.weight}</td>
                        <td className="py-3 px-3 text-white">{r.fare}</td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-bold">{r.contribution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Carrier Contribution Grid */}
            {activeTab === 'carrier' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CARRIER_INDICES.map((c) => (
                  <div key={c.carrier} className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
                    <div className="text-xs text-slate-400">{c.carrier}</div>
                    <div className="text-2xl font-bold font-mono text-white mt-1">{c.index}</div>
                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-700/50">
                      <span className="text-slate-400">MoM Shift:</span>
                      <span className="font-mono font-semibold text-emerald-400">{c.mom}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Fare Distribution Percentiles */}
            {activeTab === 'distribution' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400">
                  Fare bucket distribution across all active domestic quote observations (P10: ₹3,400, P50: ₹5,800, P90: ₹9,200).
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FARE_DISTRIBUTION}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Bar dataKey="pct" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>

          {/* Terminal Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
            <div>
              Status: <span className="text-emerald-400">NSO/MoSPI CPI Sub-Index Feed Synced</span>
            </div>
            <div>
              Next Re-weighting: <strong className="text-slate-300">Q3 DGCA Census Release</strong>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
