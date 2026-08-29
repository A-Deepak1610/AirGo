import React, { useState } from 'react';
import { 
  TrendingUp, 
  Layers, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  ArrowUpRight, 
  Sparkles, 
  Download,
  Info
} from 'lucide-react';
import { HistoricalTrendChart } from '../components/dashboard/HistoricalTrendChart';

export const AirfareIndexPage = () => {
  const [selectedModel, setSelectedModel] = useState('dgca_weighted');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> High-Frequency Econometric Index Formulation
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Airfare Price Index (APIx) Econometric Series
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
            National airfare inflation index aggregating price quotes across advance purchase windows (T+1 to T+45) with official DGCA traffic weights ($w_i$).
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start lg:self-auto">
          {[
            { id: 'dgca_weighted', label: 'DGCA Weighted (Official)' },
            { id: 'laspeyres', label: 'Laspeyres Base Basket' },
            { id: 'jevons', label: 'Jevons Geometric Mean' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModel(m.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedModel === m.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Index Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Latest APIx Index (Aug 2026)</span>
          <div className="text-3xl font-black text-blue-600 mt-2">128.60</div>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +1.8% MoM (+10.7% YoY)
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">T+1 Urgent Booking Index</span>
          <div className="text-3xl font-black text-red-600 mt-2">144.20</div>
          <p className="text-xs text-slate-500 mt-1">Surge premium: +32.4% over baseline</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">T+15 Core Business Index</span>
          <div className="text-3xl font-black text-slate-900 mt-2">124.80</div>
          <p className="text-xs text-slate-500 mt-1">Most stable consumption horizon</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">T+45 Leisure Advanced Index</span>
          <div className="text-3xl font-black text-emerald-600 mt-2">112.30</div>
          <p className="text-xs text-slate-500 mt-1">Base economy seat availability</p>
        </div>
      </div>

      {/* Main Chart */}
      <HistoricalTrendChart />

      {/* Advance Booking Curve Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Advance Purchase Window Elasticity Matrix</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { window: 'T+1 Day', price: '₹9,840', share: '18% Weight', change: '+14.2% DoD', color: 'border-red-200 bg-red-50/40 text-red-700' },
            { window: 'T+7 Days', price: '₹7,620', share: '24% Weight', change: '+4.1% WoW', color: 'border-amber-200 bg-amber-50/40 text-amber-700' },
            { window: 'T+15 Days', price: '₹6,480', share: '32% Weight', change: '+0.8% MoM', color: 'border-blue-200 bg-blue-50/40 text-blue-700' },
            { window: 'T+30 Days', price: '₹5,820', share: '16% Weight', change: '-1.2% MoM', color: 'border-emerald-200 bg-emerald-50/40 text-emerald-700' },
            { window: 'T+45 Days', price: '₹5,140', share: '10% Weight', change: '-3.4% MoM', color: 'border-slate-200 bg-slate-50 text-slate-700' }
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${item.color} space-y-1.5`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.window}</span>
              <div className="text-xl font-extrabold text-slate-900">{item.price}</div>
              <div className="text-xs font-semibold">{item.change}</div>
              <div className="text-[10px] text-slate-500 font-medium">{item.share}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
