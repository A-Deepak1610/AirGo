import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowRight, 
  Plane, 
  TrendingUp, 
  Database, 
  Activity, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const DashboardPreviewSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>OPERATIONAL PLATFORM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              A complete airfare intelligence dashboard.
            </h2>
            <p className="mt-2 text-base text-slate-600 font-normal max-w-xl">
              Built for central bank economists, civil aviation authorities, and research teams requiring audited price transparency.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start md:self-auto"
          >
            <span>Launch Live Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Interactive React Dashboard Mockup Card */}
        <div className="mt-10 bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Top Mockup App Bar */}
          <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-slate-400">|</span>
              <span className="font-mono font-bold text-slate-200">airgo.gov.in / terminal / realtime-apix</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Pipeline: 15m Sync
              </span>
              <span className="text-slate-400">Quotes: <strong className="text-white">1,482,920</strong></span>
            </div>
          </div>

          {/* Mockup Content Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Top 4 KPI Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Headline APIx (2024=100)</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">118.4</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">↑ +3.8% MoM Inflation</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Quotes Ingested Today</div>
                <div className="text-2xl font-bold font-mono text-blue-600 mt-1">42,850</div>
                <div className="text-xs text-slate-500 mt-1">100% SHA-256 Validated</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Active Corridors Monitored</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">20 Hubs / 42 Pairs</div>
                <div className="text-xs text-slate-500 mt-1">82.4% Traffic Coverage</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Average Domestic Fare</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">₹5,940</div>
                <div className="text-xs text-amber-600 font-semibold mt-1">High Volatility Window</div>
              </div>
            </div>

            {/* Split Row: Corridor Rankings & Carrier Share Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Corridor Rankings Table (7 Cols) */}
              <div className="lg:col-span-7 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider">
                    Core Corridor Price Movements
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">DGCA Weight Ordered</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs font-sans mt-2">
                  {[
                    { pair: 'DEL ↔ BOM', name: 'Delhi - Mumbai', fare: '₹5,940', change: '+1.4%', weight: '5.85%', surge: 'High' },
                    { pair: 'BLR ↔ DEL', name: 'Bengaluru - Delhi', fare: '₹6,420', change: '+0.8%', weight: '4.00%', surge: 'High' },
                    { pair: 'BOM ↔ BLR', name: 'Mumbai - Bengaluru', fare: '₹4,350', change: '-0.4%', weight: '3.51%', surge: 'Moderate' },
                    { pair: 'DEL ↔ HYD', name: 'Delhi - Hyderabad', fare: '₹5,120', change: '+0.6%', weight: '2.82%', surge: 'Moderate' }
                  ].map((r) => (
                    <div key={r.pair} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors">
                      <div>
                        <span className="font-mono font-bold text-blue-600">{r.pair}</span>
                        <span className="text-slate-500 ml-2 text-[11px] hidden sm:inline">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-6 font-mono">
                        <span className="font-bold text-slate-900">{r.fare}</span>
                        <span className={`font-semibold ${r.change.startsWith('+') ? 'text-red-600' : 'text-emerald-600'}`}>
                          {r.change}
                        </span>
                        <span className="text-slate-400 text-[11px] hidden md:inline">{r.weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrier Comparison & Freshness Telemetry (5 Cols) */}
              <div className="lg:col-span-5 border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-200">
                    Carrier Yield Divergence
                  </div>

                  <div className="mt-3 space-y-3 text-xs">
                    {[
                      { name: 'IndiGo (6E)', index: 124.2, bar: '82%', color: 'bg-blue-600' },
                      { name: 'Air India (AI)', index: 127.8, bar: '91%', color: 'bg-indigo-600' },
                      { name: 'Akasa Air (QP)', index: 119.4, bar: '68%', color: 'bg-emerald-500' },
                      { name: 'SpiceJet (SG)', index: 125.1, bar: '84%', color: 'bg-amber-500' }
                    ].map((c) => (
                      <div key={c.name} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-700">{c.name}</span>
                          <span className="font-mono font-bold text-slate-900">{c.index}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full ${c.color} rounded-full`} style={{ width: c.bar }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Data Freshness: <strong>99.8%</strong></span>
                  <span className="text-blue-600 font-medium">Auto-refreshes every 15 min</span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Callout Bar */}
          <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Full audit trail with raw DOM snapshots and ground-truth screenshot proof available for every scraped fare.</span>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore full terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
