import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { TrendingUp, Clock, AlertCircle, Info } from 'lucide-react';

const ELASTICITY_DATA = [
  { window: 'T+1', 'DEL-BOM': 9850, 'BLR-DEL': 10400, 'BOM-GOI': 5600 },
  { window: 'T+7', 'DEL-BOM': 7420, 'BLR-DEL': 7950, 'BOM-GOI': 4400 },
  { window: 'T+15', 'DEL-BOM': 6600, 'BLR-DEL': 6900, 'BOM-GOI': 3800 },
  { window: 'T+30', 'DEL-BOM': 5120, 'BLR-DEL': 5650, 'BOM-GOI': 3350 },
  { window: 'T+45', 'DEL-BOM': 4250, 'BLR-DEL': 4800, 'BOM-GOI': 3100 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 text-white rounded-xl p-3 shadow-xl text-xs font-sans">
        <div className="font-mono text-slate-400 font-semibold mb-2">
          DEPARTURE HORIZON: <span className="text-white">{label}</span>
        </div>
        <div className="space-y-1.5 font-mono">
          {payload.map((p) => (
            <div key={p.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: p.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name}:</span>
              </span>
              <span className="font-bold text-white">₹{p.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const LeadTimeElasticitySection = () => {
  return (
    <section className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>PRICE ELASTICITY DYNAMICS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            The closer the flight, the different the price signal.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Airfare price indices cannot rely on a single advance purchase date. The elasticity curve proves prices accelerate sharply inside T-7 days as business inelasticity takes over.
          </p>
        </div>

        {/* Chart Container Card */}
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-blue-600 rounded-full"></span>
                <span className="font-mono font-bold text-slate-900">DEL-BOM</span>
                <span className="text-slate-500">(Business Trunk)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-indigo-600 rounded-full"></span>
                <span className="font-mono font-bold text-slate-900">BLR-DEL</span>
                <span className="text-slate-500">(Tech Long-Haul)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-emerald-500 rounded-full"></span>
                <span className="font-mono font-bold text-slate-900">BOM-GOI</span>
                <span className="text-slate-500">(Leisure Short-Hop)</span>
              </div>
            </div>

            <span className="font-mono text-slate-500 text-[11px]">
              T+1 Surge Multiplier: <strong>2.32x vs T+45</strong>
            </span>
          </div>

          <div className="h-72 sm:h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ELASTICITY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="window" 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[2000, 12000]}
                  stroke="#94a3b8" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(v) => `₹${v / 1000}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="DEL-BOM" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: '#2563eb' }} />
                <Line type="monotone" dataKey="BLR-DEL" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: '#4f46e5' }} />
                <Line type="monotone" dataKey="BOM-GOI" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 3 Metric Insights */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold">T+1 to T+7 Acceleration</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">+32.7%</div>
              <p className="mt-1 text-slate-500 leading-snug">
                Highest rate of price change occurs in the final 72 hours before flight departure.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold">T+15 to T+30 Plateau</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">Stable ±4%</div>
              <p className="mt-1 text-slate-500 leading-snug">
                Fares exhibit standard competitive equilibrium between 15 and 30 days out.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold">Leisure vs Business Resilience</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">1.8x vs 2.4x</div>
              <p className="mt-1 text-slate-500 leading-snug">
                Leisure corridors (BOM-GOI) maintain flatter elasticity curves than corporate trunks.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
