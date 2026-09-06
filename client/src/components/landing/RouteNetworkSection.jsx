import React, { useState } from 'react';
import { Plane, Radio, MapPin, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { IndiaAviation3DMap } from '../network/IndiaAviation3DMap';
import { AIRPORTS, FLIGHT_CORRIDORS } from '../network/indiaGeoData';

export const RouteNetworkSection = () => {
  const [activeCorridorId, setActiveCorridorId] = useState('DEL-BOM');

  const selectedCorridor = FLIGHT_CORRIDORS.find(c => c.id === activeCorridorId) || FLIGHT_CORRIDORS[0];

  return (
    <section id="network" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>SPATIAL AVIATION INTELLIGENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              See India's airfare network in motion.
            </h2>
            <p className="mt-2 text-base text-slate-600 font-normal max-w-2xl">
              20 core DGCA city-pair corridors capturing 82.4% of domestic passenger movement. Real-time 3D flight arcs, active photon flows, and live fare surge telemetry.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-600 self-start md:self-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>20 Major Hubs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>42 Monitored Arcs</span>
            </div>
          </div>
        </div>

        {/* 3D Map Visualization & Telemetry Cards */}
        <div className="mt-8 space-y-4">
          {/* Main 3D Radar Container */}
          <div className="rounded-2xl border border-slate-800 shadow-xl overflow-hidden bg-[#0a0f1d]">
            <IndiaAviation3DMap 
              defaultRoute={activeCorridorId}
              onSelectRoute={(id) => setActiveCorridorId(id)}
              height="580px"
              showControls={true}
            />
          </div>

          {/* Quick Route Selector Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Quick Select High-Volume Corridors:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'DEL-BOM', label: 'DEL ↔ BOM', fare: '₹5,940' },
                { id: 'BLR-DEL', label: 'BLR ↔ DEL', fare: '₹6,420' },
                { id: 'DEL-HYD', label: 'DEL ↔ HYD', fare: '₹5,120' },
                { id: 'CCU-DEL', label: 'CCU ↔ DEL', fare: '₹5,850' },
                { id: 'MAA-DEL', label: 'MAA ↔ DEL', fare: '₹6,150' },
                { id: 'BOM-GOI', label: 'BOM ↔ GOI', fare: '₹3,650' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCorridorId(c.id)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                    activeCorridorId === c.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="ml-1.5 opacity-80">({c.fare})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
