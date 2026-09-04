import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Flame, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { getRouteAnalyticsList } from '../../services/api';

export const RouteHeatmapGrid = () => {
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState('yoy'); // 'yoy' | 'index' | 'mom' | 'fare' | 'volatility' | 't1Surge' | 't45Discount'
  const routes = getRouteAnalyticsList();

  const metricsConfig = {
    yoy: { label: 'YoY Inflation (%)', getVal: r => r.yoyPct, format: v => `${v > 0 ? '+' : ''}${v}%`, getHeat: v => v > 8 ? 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100' : v > 4 ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100' },
    index: { label: 'Airfare Index', getVal: r => r.index, format: v => v, getHeat: v => v > 125 ? 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100' : v > 115 ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100' : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100' },
    mom: { label: 'MoM Change (%)', getVal: r => r.momPct, format: v => `${v > 0 ? '+' : ''}${v}%`, getHeat: v => v > 2.5 ? 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100' : v > 1.0 ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100' },
    fare: { label: 'Average Fare (₹)', getVal: r => r.avgFare, format: v => `₹${v.toLocaleString()}`, getHeat: v => v > 6000 ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100' : v > 4800 ? 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100' },
    volatility: { label: 'Price Volatility (σ)', getVal: r => r.volatilityScore, format: v => v, getHeat: v => v > 4.5 ? 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100' : v > 3.0 ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100' : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100' },
    t1Surge: { label: 'T+1 Premium (%)', getVal: r => r.t1SurgePct, format: v => `+${v}%`, getHeat: v => v > 45 ? 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100' : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100' },
    t45Discount: { label: 'T+45 Discount (%)', getVal: r => r.t45DiscountPct, format: v => `-${v}%`, getHeat: v => 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100' }
  };

  const currCfg = metricsConfig[selectedMetric];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4 text-slate-900">
      {/* Controls & Metric Selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>DGCA National Corridors Price Pressure Heatmap</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual matrix highlighting regional price pressures and inflation concentration across top Indian routes.
          </p>
        </div>

        {/* Switch Metric Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
          {Object.entries(metricsConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all ${
                selectedMetric === key
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cfg.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {routes.map((r) => {
          const val = currCfg.getVal(r);
          const heatStyle = currCfg.getHeat(val);
          const formattedVal = currCfg.format(val);

          return (
            <div
              key={r.route}
              onClick={() => navigate(`/index/routes/${r.route}`)}
              className={`p-3.5 rounded-xl border ${heatStyle} cursor-pointer hover:scale-[1.02] transition-all space-y-1 shadow-2xs`}
            >
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span>{r.route}</span>
                <span className="text-[10px] opacity-75">{r.tier}</span>
              </div>
              <div className="text-xs opacity-80 truncate">{r.city1} ↔ {r.city2}</div>
              <div className="text-lg font-black mt-1 font-mono">{formattedVal}</div>
              <div className="text-[10px] opacity-75 font-medium flex justify-between items-center pt-1 border-t border-current/20">
                <span>Weight: {r.weightPct}%</span>
                <span>Avg: ₹{(r.avgFare/1000).toFixed(1)}k</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
