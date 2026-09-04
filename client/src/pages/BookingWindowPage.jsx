import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { LeadTimeCurveChart } from '../components/analytics/LeadTimeCurveChart';
import { getRouteAnalyticsList } from '../services/api';

export const BookingWindowPage = () => {
  const [selectedWindow, setSelectedWindow] = useState('T+15');
  const routes = getRouteAnalyticsList();

  const windowConfig = {
    'T+1': { title: 'T+1 Urgent Booking Window', desc: 'Flights departing tomorrow (Emergency / Urgent business travel horizon)', surge: '2.15x Surge Multiplier over T+45 baseline' },
    'T+7': { title: 'T+7 Short-Notice Window', desc: 'Flights departing within 1 week (Typical business travel horizon)', surge: '1.52x Multiplier over baseline' },
    'T+15': { title: 'T+15 Core Booking Window', desc: 'Flights departing in 2 weeks (Most stable consumer purchase horizon)', surge: '1.24x Multiplier over baseline' },
    'T+30': { title: 'T+30 Monthly Advance Window', desc: 'Flights departing in 1 month (Early planning / leisure bucket)', surge: '1.08x Multiplier over baseline' },
    'T+45': { title: 'T+45 Leisure Baseline Window', desc: 'Flights departing in 45 days (Base economy seat availability bucket)', surge: '1.00x Baseline Reference' }
  };

  const currConfig = windowConfig[selectedWindow];

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Booking Window Analysis', path: '/index/booking-window' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Advance Purchase Horizon Matrix (T+1 to T+45)
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Analyzing algorithmic yield management, price elasticity, and seat availability dynamics across advance horizons.
          </p>
        </div>

        {/* Window Switcher Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
          {Object.keys(windowConfig).map((wKey) => (
            <button
              key={wKey}
              onClick={() => setSelectedWindow(wKey)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
                selectedWindow === wKey
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {wKey}
            </button>
          ))}
        </div>
      </div>

      {/* Active Window Context Banner */}
      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            {selectedWindow} Horizon Active Focus
          </span>
          <h2 className="text-lg font-bold text-slate-900">{currConfig.title}</h2>
          <p className="text-xs text-slate-600">{currConfig.desc}</p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Yield Surge Multiplier</span>
          <span className="text-xl font-black font-mono text-slate-900">{currConfig.surge}</span>
        </div>
      </div>

      {/* Embedded Lead Time Curve */}
      <LeadTimeCurveChart routeCode="DEL-BOM" />

      {/* Corridors breakdown for selected window */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>{selectedWindow} Horizon Pricing Across All 20 DGCA Corridors</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Corridor</th>
                <th className="py-2.5 px-3 font-semibold">{selectedWindow} Avg Fare</th>
                <th className="py-2.5 px-3 font-semibold">Window Index</th>
                <th className="py-2.5 px-3 font-semibold">YoY Inflation</th>
                <th className="py-2.5 px-3 font-semibold">Seat Availability</th>
                <th className="py-2.5 px-3 font-semibold">Median Fare</th>
                <th className="py-2.5 px-3 font-semibold">Min / Max Range</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Std Dev (σ)</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const wData = r.windows[selectedWindow];
                return (
                  <tr key={r.route} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-blue-600 font-mono">{r.route}</span>
                      <span className="text-[10px] text-slate-400">({r.city1} ↔ {r.city2})</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">₹{wData.avgFare.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-600">{wData.index}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">+{wData.yoy}%</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{wData.availabilityPct}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">₹{wData.median.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">₹{wData.min} - ₹{wData.max}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">±₹{wData.stdDev}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
