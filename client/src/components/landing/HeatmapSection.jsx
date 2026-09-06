import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Compass, Filter } from 'lucide-react';
import { FLIGHT_CORRIDORS } from '../network/indiaGeoData';

export const HeatmapSection = () => {
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'SURGE' | 'COOLING'

  const heatmapRoutes = [
    { id: 'DEL-BOM', label: 'Delhi ↔ Mumbai', change: '+12.4%', changeNum: 12.4, fare: '₹6,842', base: '₹4,800', type: 'Surge', pax: '7.8M Pax', rank: '#1' },
    { id: 'BLR-HYD', label: 'Bengaluru ↔ Hyderabad', change: '+8.2%', changeNum: 8.2, fare: '₹4,250', base: '₹3,100', type: 'Surge', pax: '3.2M Pax', rank: '#8' },
    { id: 'BOM-BLR', label: 'Mumbai ↔ Bengaluru', change: '+5.7%', changeNum: 5.7, fare: '₹4,350', base: '₹3,700', type: 'Moderate', pax: '4.9M Pax', rank: '#3' },
    { id: 'DEL-SXR', label: 'Delhi ↔ Srinagar', change: '+18.6%', changeNum: 18.6, fare: '₹6,890', base: '₹5,200', type: 'Surge', pax: '2.4M Pax', rank: '#12' },
    { id: 'CCU-DEL', label: 'Kolkata ↔ Delhi', change: '+4.5%', changeNum: 4.5, fare: '₹5,850', base: '₹4,700', type: 'Moderate', pax: '3.6M Pax', rank: '#6' },
    { id: 'MAA-DEL', label: 'Chennai ↔ Delhi', change: '-2.1%', changeNum: -2.1, fare: '₹6,150', base: '₹5,100', type: 'Cooling', pax: '3.1M Pax', rank: '#7' },
    { id: 'BOM-GOI', label: 'Mumbai ↔ Goa', change: '-4.2%', changeNum: -4.2, fare: '₹3,650', base: '₹3,200', type: 'Cooling', pax: '2.8M Pax', rank: '#9' },
    { id: 'BLR-GOI', label: 'Bengaluru ↔ Goa', change: '-1.5%', changeNum: -1.5, fare: '₹3,280', base: '₹3,000', type: 'Cooling', pax: '1.9M Pax', rank: '#18' }
  ];

  const filteredRoutes = heatmapRoutes.filter(r => {
    if (selectedFilter === 'SURGE') return r.changeNum > 5.0;
    if (selectedFilter === 'COOLING') return r.changeNum <= 0.0;
    return true;
  });

  return (
    <section id="heatmap" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>CORRIDOR INTENSITY MATRIX</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Where are fares moving?
            </h2>
            <p className="mt-2 text-base text-slate-600 font-normal max-w-xl">
              Geographic corridor heatmap highlighting high-yield surge sectors and cooling routes across the domestic airspace.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-medium self-start md:self-auto shadow-2xs">
            {[
              { id: 'ALL', label: 'All Corridors' },
              { id: 'SURGE', label: 'Yield Surge (>+5%)' },
              { id: 'COOLING', label: 'Cooling / Discounts' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Corridor Cards Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredRoutes.map((r) => {
            const isSurge = r.changeNum > 0;
            return (
              <div
                key={r.id}
                className={`p-5 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md ${
                  r.changeNum > 10
                    ? 'border-red-200 hover:border-red-400'
                    : r.changeNum > 0
                    ? 'border-blue-200 hover:border-blue-400'
                    : 'border-emerald-200 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {r.rank} · {r.id}
                  </span>
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    isSurge 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isSurge ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {r.change}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {r.label}
                </h3>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CURRENT FARE</span>
                    <span className="text-base font-bold text-slate-900">{r.fare}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">BASELINE</span>
                    <span className="text-slate-600">{r.base}</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Annual Traffic: <strong>{r.pax}</strong></span>
                  <span className={`font-semibold ${isSurge ? 'text-red-600' : 'text-emerald-600'}`}>
                    {r.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
