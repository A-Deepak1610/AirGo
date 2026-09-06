import React from 'react';
import { IndiaNetworkMap } from './IndiaNetworkMap';
import { Compass, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NetworkSection = () => {
  const navigate = useNavigate();

  const keyCorridors = [
    { route: 'DEL ↔ BOM', name: 'Delhi — Mumbai', pax: '7.42M Pax', fare: '₹8,450', surge: '+48%', status: 'HIGH_VOLATILITY' },
    { route: 'DEL ↔ BLR', name: 'Delhi — Bengaluru', pax: '5.10M Pax', fare: '₹6,890', surge: '+26%', status: 'MODERATE_SURGE' },
    { route: 'BOM ↔ BLR', name: 'Mumbai — Bengaluru', pax: '3.95M Pax', fare: '₹5,850', surge: '+31%', status: 'MODERATE_SURGE' },
    { route: 'DEL ↔ CCU', name: 'Delhi — Kolkata', pax: '3.40M Pax', fare: '₹6,150', surge: '+22%', status: 'STABLE_TRUNK' },
    { route: 'BLR ↔ HYD', name: 'Bengaluru — Hyderabad', pax: '2.85M Pax', fare: '₹3,650', surge: '+4%', status: 'STABLE_TRUNK' },
    { route: 'MAA ↔ DEL', name: 'Chennai — Delhi', pax: '3.12M Pax', fare: '₹5,920', surge: '+18%', status: 'STABLE_TRUNK' }
  ];

  return (
    <section id="network" className="py-16 sm:py-20 bg-[#090D18] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>National Civil Aviation Grid</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans">
              India Aviation Network
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Observe airfare movements across representative domestic city-pairs calibrated with official DGCA traffic volume weights.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => navigate('/index-apix')}
              className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Explore All 20 Trunk Corridors</span>
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Full Interactive Network Map Component */}
        <IndiaNetworkMap compact={false} />

        {/* Key Corridors Snapshot Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {keyCorridors.map((c) => (
            <div
              key={c.route}
              onClick={() => navigate(`/index/routes/${c.route.replace(/\s+↔\s+/, '-')}`)}
              className="p-3 rounded-xl bg-[#0B1120] border border-slate-800/90 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {c.route}
                </span>
                <span className={`text-[9px] font-mono font-bold ${
                  c.surge.startsWith('+4') || c.surge.startsWith('+3') ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {c.surge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.name}</p>
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">{c.pax}</span>
                <span className="font-bold text-slate-200">{c.fare}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
