import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export const LeadTimeCurveChart = ({ routeCode = 'DEL-BOM', windowData = null }) => {
  const [metric, setMetric] = useState('fare'); // 'fare' | 'index'

  const defaultWindows = {
    'T+1': { avgFare: 8200, index: 140.2, surge: '+82.2%', availabilityPct: 91 },
    'T+7': { avgFare: 6100, index: 126.4, surge: '+35.5%', availabilityPct: 94 },
    'T+15': { avgFare: 5200, index: 116.6, surge: '+15.5%', availabilityPct: 96 },
    'T+30': { avgFare: 4700, index: 110.1, surge: '+4.4%', availabilityPct: 97 },
    'T+45': { avgFare: 4500, index: 105.3, surge: 'Baseline', availabilityPct: 98 }
  };

  const windows = windowData || defaultWindows;
  const keys = ['T+45', 'T+30', 'T+15', 'T+7', 'T+1'];
  
  const values = keys.map(k => metric === 'fare' ? windows[k].avgFare : windows[k].index);
  const maxVal = Math.max(...values) * 1.15;
  const minVal = Math.min(...values) * 0.85;

  const getSvgY = (val) => {
    const height = 180;
    const padding = 20;
    return height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
  };

  const points = keys.map((k, idx) => {
    const x = 50 + idx * 110;
    const y = getSvgY(metric === 'fare' ? windows[k].avgFare : windows[k].index);
    return { key: k, x, y, val: metric === 'fare' ? windows[k].avgFare : windows[k].index, surge: windows[k].surge };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4 text-slate-900">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Advance Purchase Lead-Time Elasticity Curve ({routeCode})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Prices surge exponentially as departure date approaches (T+45 leisure baseline to T+1 urgent booking).
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setMetric('fare')}
            className={`px-3 py-1 rounded-md transition-all ${
              metric === 'fare' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Average Fare (₹)
          </button>
          <button
            onClick={() => setMetric('index')}
            className={`px-3 py-1 rounded-md transition-all ${
              metric === 'index' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Window Index
          </button>
        </div>
      </div>

      {/* SVG Interactive Curve */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox="0 0 540 210" className="w-full min-w-[500px] h-52 overflow-visible">
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[40, 80, 120, 160].map((y, i) => (
            <line key={i} x1="30" y1={y} x2="510" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
          ))}

          {/* Area under curve */}
          <path d={areaD} fill="url(#curveGradient)" />

          {/* Curve Line */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="6" className="fill-blue-600 stroke-white stroke-2 group-hover:r-8 transition-all shadow-sm" />
              <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[11px] font-bold fill-slate-900 font-mono">
                {metric === 'fare' ? `₹${p.val.toLocaleString()}` : p.val}
              </text>
              <text x={p.x} y="200" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">
                {p.key}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
        {keys.map((k) => (
          <div key={k} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{k} Window</span>
            <div className="text-sm font-bold text-slate-900">
              {metric === 'fare' ? `₹${windows[k].avgFare.toLocaleString()}` : windows[k].index}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600">
              {windows[k].availabilityPct}% seat avail
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
