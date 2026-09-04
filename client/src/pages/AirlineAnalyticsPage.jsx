import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { getAirlineAnalyticsList } from '../services/api';

export const AirlineAnalyticsPage = () => {
  const airlines = getAirlineAnalyticsList();
  const [selectedAirlines, setSelectedAirlines] = useState(['6E', 'AI', 'QP', 'SG']);

  const toggleAirline = (code) => {
    if (selectedAirlines.includes(code)) {
      if (selectedAirlines.length > 1) setSelectedAirlines(selectedAirlines.filter(c => c !== code));
    } else {
      setSelectedAirlines([...selectedAirlines, code]);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Airline Price Analytics', path: '/index/airlines' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Airline Tariff & Yield Analytics
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Comparative pricing, yield surge multipliers, and market-share weighted index contributions across Indian carriers.
          </p>
        </div>

        {/* Airline Selector Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {airlines.map((a) => {
            const isSelected = selectedAirlines.includes(a.code);
            return (
              <button
                key={a.code}
                onClick={() => toggleAirline(a.code)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                {a.name} ({a.code})
              </button>
            );
          })}
        </div>
      </div>

      {/* Airline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {airlines.map((a) => (
          <div key={a.code} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-base font-bold text-slate-900">{a.name} ({a.code})</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Market Share: {a.marketSharePct}%</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold font-mono border border-slate-200">
                Idx: {a.index}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 font-mono">₹{a.avgFare.toLocaleString()}</div>
              <div className="text-xs font-bold text-emerald-600">+{a.yoyPct}% YoY (+{a.momPct}% MoM)</div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">T+1 Urgent Avg:</span>
                <span className="font-mono font-bold text-red-600">₹{a.t1AvgFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">T+45 Leisure Avg:</span>
                <span className="font-mono font-bold text-emerald-600">₹{a.t45AvgFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Yield Multiplier:</span>
                <span className="font-mono font-bold text-amber-700">{a.surgeMultiplier}x</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Airline Comparative Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>Cross-Airline Econometric Comparison Table</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Airline Carrier</th>
                <th className="py-2.5 px-3 font-semibold">DGCA Pax Share</th>
                <th className="py-2.5 px-3 font-semibold">Average Fare</th>
                <th className="py-2.5 px-3 font-semibold">Carrier Index</th>
                <th className="py-2.5 px-3 font-semibold">YoY Inflation</th>
                <th className="py-2.5 px-3 font-semibold">MoM Change</th>
                <th className="py-2.5 px-3 font-semibold">T+1 Avg Fare</th>
                <th className="py-2.5 px-3 font-semibold">T+45 Avg Fare</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Volatility (σ)</th>
              </tr>
            </thead>
            <tbody>
              {airlines.map((a) => (
                <tr key={a.code} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono text-[11px]">{a.code}</span>
                    <span>{a.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{a.marketSharePct}%</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">₹{a.avgFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 font-bold">{a.index}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">+{a.yoyPct}%</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">+{a.momPct}%</td>
                  <td className="py-2.5 px-3 font-mono text-red-600 font-bold">₹{a.t1AvgFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">₹{a.t45AvgFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-700">σ {a.volatilityScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
