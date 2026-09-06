import React, { useState } from 'react';
import { 
  Search, 
  Layers, 
  Plane, 
  Check, 
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IndiaNetworkMap = ({ compact = false, onSelectRoute }) => {
  const navigate = useNavigate();
  const [activeLayers, setActiveLayers] = useState({
    airports: true,
    liveRoutes: true,
    historicalRoutes: true,
    surgeAlerts: true,
    stressScore: false
  });
  const [dataMode, setDataMode] = useState('LIVE'); // 'ALL' | 'LIVE' | 'HISTORICAL'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState({
    type: 'route',
    code: 'DEL-BOM',
    origin: 'DEL (Delhi)',
    destination: 'BOM (Mumbai)',
    status: 'CRITICAL_SURGE',
    fare: '₹8,450',
    index: 124.2,
    surge: '+48%',
    frequency: '92 flights/day'
  });

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 25 Airport Nodes with exact coordinates calibrated to stylized India vector outline
  const airports = [
    { code: 'SXR', name: 'Srinagar', x: 275, y: 110, type: 'regional', color: '#38BDF8' },
    { code: 'IXJ', name: 'Jammu', x: 270, y: 130, type: 'regional', color: '#64748B' },
    { code: 'ATQ', name: 'Amritsar', x: 260, y: 155, type: 'regional', color: '#A855F7' },
    { code: 'DED', name: 'Dehradun', x: 315, y: 170, type: 'regional', color: '#38BDF8' },
    { code: 'DEL', name: 'New Delhi (Indira Gandhi Intl)', x: 300, y: 195, type: 'hub', color: '#A855F7', radius: 8, hub: true },
    { code: 'JAI', name: 'Jaipur', x: 275, y: 220, type: 'tier1', color: '#38BDF8' },
    { code: 'LKO', name: 'Lucknow', x: 360, y: 220, type: 'tier1', color: '#A855F7' },
    { code: 'VNS', name: 'Varanasi', x: 410, y: 240, type: 'tier1', color: '#38BDF8' },
    { code: 'PAT', name: 'Patna', x: 450, y: 240, type: 'tier1', color: '#A855F7' },
    { code: 'IXB', name: 'Bagdogra', x: 520, y: 225, type: 'regional', color: '#38BDF8' },
    { code: 'GAU', name: 'Guwahati', x: 590, y: 230, type: 'regional', color: '#A855F7' },
    { code: 'IMF', name: 'Imphal', x: 635, y: 245, type: 'regional', color: '#64748B' },
    { code: 'AMD', name: 'Ahmedabad', x: 220, y: 270, type: 'tier1', color: '#A855F7' },
    { code: 'IDR', name: 'Indore', x: 280, y: 285, type: 'regional', color: '#A855F7' },
    { code: 'NAG', name: 'Nagpur', x: 340, y: 300, type: 'regional', color: '#A855F7' },
    { code: 'RPR', name: 'Raipur', x: 400, y: 300, type: 'regional', color: '#38BDF8' },
    { code: 'IXR', name: 'Ranchi', x: 455, y: 280, type: 'regional', color: '#64748B' },
    { code: 'CCU', name: 'Kolkata (Netaji Subhash Intl)', x: 505, y: 280, type: 'hub', color: '#A855F7', radius: 7, hub: true },
    { code: 'BBI', name: 'Bhubaneswar', x: 460, y: 320, type: 'regional', color: '#38BDF8' },
    { code: 'BOM', name: 'Mumbai (Chhatrapati Shivaji Intl)', x: 230, y: 345, type: 'hub', color: '#A855F7', radius: 8, hub: true },
    { code: 'PNQ', name: 'Pune', x: 250, y: 355, type: 'tier1', color: '#38BDF8' },
    { code: 'GOI', name: 'Goa (Dabolim / Mopa)', x: 240, y: 395, type: 'tier1', color: '#A855F7' },
    { code: 'HYD', name: 'Hyderabad (Rajiv Gandhi Intl)', x: 330, y: 370, type: 'tier1', color: '#A855F7', radius: 6 },
    { code: 'VTZ', name: 'Visakhapatnam', x: 405, y: 365, type: 'regional', color: '#A855F7' },
    { code: 'BLR', name: 'Bengaluru (Kempegowda Intl)', x: 305, y: 440, type: 'hub', color: '#A855F7', radius: 8, hub: true },
    { code: 'MAA', name: 'Chennai (Meenambakkam Intl)', x: 345, y: 450, type: 'tier1', color: '#38BDF8' },
    { code: 'COK', name: 'Kochi', x: 295, y: 485, type: 'tier1', color: '#A855F7' },
    { code: 'TRV', name: 'Thiruvananthapuram', x: 300, y: 510, type: 'regional', color: '#A855F7' },
    { code: 'IXZ', name: 'Port Blair', x: 615, y: 455, type: 'regional', color: '#64748B' }
  ];

  // Route arcs with quadratic bezier paths
  const routes = [
    // DEL-BOM (Multiple intense arcs in amber, cyan, emerald)
    { id: 'DEL-BOM-1', from: 'DEL', to: 'BOM', d: 'M 300 195 Q 235 250 230 345', stroke: '#F59E0B', width: 2.5, type: 'surge', label: 'DEL ↔ BOM', fare: '₹8,450', index: 124.2, surge: '+48%' },
    { id: 'DEL-BOM-2', from: 'DEL', to: 'BOM', d: 'M 300 195 Q 255 265 230 345', stroke: '#06B6D4', width: 2.0, type: 'live', label: 'DEL ↔ BOM (Live)', fare: '₹7,920', index: 121.0, surge: '+36%' },
    { id: 'DEL-BOM-3', from: 'DEL', to: 'BOM', d: 'M 300 195 Q 275 280 230 345', stroke: '#10B981', width: 1.5, type: 'live', label: 'DEL ↔ BOM (Base)', fare: '₹5,400', index: 114.5, surge: '+12%' },

    // DEL-BLR (Long-haul trunk)
    { id: 'DEL-BLR-1', from: 'DEL', to: 'BLR', d: 'M 300 195 Q 275 320 305 440', stroke: '#06B6D4', width: 2.2, type: 'live', label: 'DEL ↔ BLR', fare: '₹6,890', index: 119.8, surge: '+26%' },
    { id: 'DEL-BLR-2', from: 'DEL', to: 'BLR', d: 'M 300 195 Q 295 320 305 440', stroke: '#10B981', width: 1.5, type: 'live', label: 'DEL ↔ BLR (T+7)', fare: '₹5,620', index: 112.4, surge: '+8%' },

    // BOM-BLR (South trunk)
    { id: 'BOM-BLR-1', from: 'BOM', to: 'BLR', d: 'M 230 345 Q 260 400 305 440', stroke: '#F59E0B', width: 2.2, type: 'surge', label: 'BOM ↔ BLR', fare: '₹5,850', index: 122.5, surge: '+31%' },
    { id: 'BOM-BLR-2', from: 'BOM', to: 'BLR', d: 'M 230 345 Q 275 390 305 440', stroke: '#06B6D4', width: 1.8, type: 'live', label: 'BOM ↔ BLR (Live)', fare: '₹4,980', index: 115.1, surge: '+15%' },

    // DEL-CCU (East corridor)
    { id: 'DEL-CCU-1', from: 'DEL', to: 'CCU', d: 'M 300 195 Q 400 215 505 280', stroke: '#A855F7', width: 2.0, type: 'live', label: 'DEL ↔ CCU', fare: '₹6,150', index: 117.3, surge: '+22%' },

    // DEL-HYD
    { id: 'DEL-HYD-1', from: 'DEL', to: 'HYD', d: 'M 300 195 Q 320 280 330 370', stroke: '#06B6D4', width: 2.0, type: 'live', label: 'DEL ↔ HYD', fare: '₹5,750', index: 116.8, surge: '+19%' },

    // BLR-HYD
    { id: 'BLR-HYD-1', from: 'BLR', to: 'HYD', d: 'M 305 440 Q 325 405 330 370', stroke: '#10B981', width: 1.8, type: 'live', label: 'BLR ↔ HYD', fare: '₹3,650', index: 108.4, surge: '+4%' },

    // BLR-MAA
    { id: 'BLR-MAA-1', from: 'BLR', to: 'MAA', d: 'M 305 440 Q 325 445 345 450', stroke: '#06B6D4', width: 1.8, type: 'live', label: 'BLR ↔ MAA', fare: '₹3,200', index: 106.2, surge: '+2%' },

    // BOM-GOI (High surge leisure)
    { id: 'BOM-GOI-1', from: 'BOM', to: 'GOI', d: 'M 230 345 Q 230 370 240 395', stroke: '#F59E0B', width: 2.0, type: 'surge', label: 'BOM ↔ GOI', fare: '₹4,950', index: 126.8, surge: '+42%' },

    // DEL-SXR (North tourist)
    { id: 'DEL-SXR-1', from: 'DEL', to: 'SXR', d: 'M 300 195 Q 285 145 275 110', stroke: '#38BDF8', width: 1.8, type: 'historical', label: 'DEL ↔ SXR', fare: '₹6,450', index: 118.0, surge: '+24%' },

    // CCU-GAU (North-East trunk)
    { id: 'CCU-GAU-1', from: 'CCU', to: 'GAU', d: 'M 505 280 Q 550 250 590 230', stroke: '#10B981', width: 1.8, type: 'live', label: 'CCU ↔ GAU', fare: '₹4,100', index: 110.5, surge: '+6%' }
  ];

  // Filter routes based on data mode and active layers
  const visibleRoutes = routes.filter(r => {
    if (!activeLayers.liveRoutes && r.type === 'live') return false;
    if (!activeLayers.historicalRoutes && r.type === 'historical') return false;
    if (!activeLayers.surgeAlerts && r.type === 'surge') return false;
    if (dataMode === 'LIVE' && r.type === 'historical') return false;
    if (dataMode === 'HISTORICAL' && r.type !== 'historical') return false;
    return true;
  });

  const handleRouteClick = (r) => {
    setSelectedEntity({
      type: 'route',
      code: r.label,
      origin: r.from,
      destination: r.to,
      status: r.type === 'surge' ? 'CRITICAL_SURGE' : 'NORMALIZED_LIVE',
      fare: r.fare,
      index: r.index,
      surge: r.surge,
      frequency: 'Live Feed · 15m interval'
    });
    if (onSelectRoute) onSelectRoute(r);
  };

  const handleAirportClick = (a) => {
    setSelectedEntity({
      type: 'airport',
      code: a.code,
      origin: a.name,
      destination: 'Corridor Gateway',
      status: a.hub ? 'PRIMARY_NATIONAL_HUB' : 'REGIONAL_TERMINAL',
      fare: '₹5,420 (Avg)',
      index: 118.4,
      surge: '+14%',
      frequency: 'Direct TLS Scraper Node'
    });
  };

  return (
    <div className={`bg-[#0B1120] border border-slate-800/90 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.08)] flex flex-col ${compact ? 'p-3' : 'p-4 sm:p-6'}`}>
      {/* Top Header Row (Matching reference screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
            <Plane className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-white font-mono tracking-wider uppercase">
                Full India Aviation Network Map
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Data Mode: <span className="text-cyan-400 font-bold">{dataMode}</span> | Traceable Observations Only
            </p>
          </div>
        </div>

        {/* Search & Mode Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono font-bold">
            {['ALL', 'LIVE', 'HISTORICAL'].map((m) => (
              <button
                key={m}
                onClick={() => setDataMode(m)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  dataMode === m
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          {!compact && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search airport, city, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 w-44 sm:w-56"
              />
            </div>
          )}
        </div>
      </div>

      {/* Layer Pills Row (Matching reference screenshot) */}
      {!compact && (
        <div className="flex items-center gap-2 py-2.5 border-b border-slate-800/80 flex-wrap text-xs font-mono select-none">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Layers:
          </span>
          {[
            { key: 'airports', label: 'Airports' },
            { key: 'liveRoutes', label: 'Live Routes' },
            { key: 'historicalRoutes', label: 'Historical Routes' },
            { key: 'surgeAlerts', label: 'Surge Alerts' },
            { key: 'stressScore', label: 'Stress Score' }
          ].map((l) => (
            <button
              key={l.key}
              onClick={() => toggleLayer(l.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                activeLayers[l.key]
                  ? 'bg-blue-900/30 border-blue-600/50 text-cyan-300 shadow-2xs font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
            >
              <Check className={`w-3 h-3 ${activeLayers[l.key] ? 'text-cyan-400' : 'opacity-0'}`} />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* SVG Canvas Map Area */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[560px] bg-[#070B14] rounded-xl my-2 border border-slate-800/60 overflow-hidden flex items-center justify-center">
        {/* Subtle radial background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_45%,rgba(6,182,212,0.06),transparent_65%)] pointer-events-none" />

        <svg
          viewBox="160 80 520 460"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glow filters for arcs */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Coordinate Technical Grid Lines */}
          <g stroke="#1E293B" strokeWidth="0.8" strokeDasharray="4 4">
            <line x1="160" y1="180" x2="680" y2="180" opacity="0.4" />
            <line x1="160" y1="280" x2="680" y2="280" opacity="0.4" />
            <line x1="160" y1="380" x2="680" y2="380" opacity="0.4" />
            <line x1="160" y1="480" x2="680" y2="480" opacity="0.4" />
            <line x1="260" y1="80" x2="260" y2="540" opacity="0.4" />
            <line x1="380" y1="80" x2="380" y2="540" opacity="0.4" />
            <line x1="500" y1="80" x2="500" y2="540" opacity="0.4" />
          </g>

          {/* Stylized Geopolitical India Subcontinent Polygon Contour */}
          <polygon
            points="
              275,100 295,115 320,150 350,175 420,210 470,225 540,215 620,220 650,260 630,290 560,285 520,310 
              480,320 460,360 410,410 360,450 320,490 300,535 285,505 270,440 240,400 220,360 215,310 
              205,270 230,240 250,200 260,150 270,110
            "
            fill="#0D1527"
            fillOpacity="0.75"
            stroke="#1E293B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          {/* Flight Route Arcs */}
          <g>
            {visibleRoutes.map((r) => {
              const isSelected = selectedEntity.code === r.label || selectedEntity.code === r.id;
              return (
                <g key={r.id} className="cursor-pointer group" onClick={() => handleRouteClick(r)}>
                  {/* Invisible wide stroke for easy clicking */}
                  <path
                    d={r.d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                  />
                  {/* Glowing background stroke */}
                  <path
                    d={r.d}
                    fill="none"
                    stroke={r.stroke}
                    strokeWidth={isSelected ? r.width * 2.2 : r.width * 1.5}
                    strokeOpacity={isSelected ? 0.9 : 0.35}
                    filter={r.type === 'surge' ? 'url(#glow-amber)' : 'url(#glow-cyan)'}
                    className="transition-all duration-300"
                  />
                  {/* Crisp core stroke */}
                  <path
                    d={r.d}
                    fill="none"
                    stroke={isSelected ? '#FFFFFF' : r.stroke}
                    strokeWidth={isSelected ? r.width + 1 : r.width}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
          </g>

          {/* Airport Nodes & Labels */}
          {activeLayers.airports && (
            <g>
              {airports.map((a) => {
                const isSelected = selectedEntity.code === a.code;
                const r = a.radius || 5;

                return (
                  <g 
                    key={a.code} 
                    className="cursor-pointer group" 
                    onClick={() => handleAirportClick(a)}
                  >
                    {/* Pulsing ring for hub nodes */}
                    {a.hub && (
                      <circle
                        cx={a.x}
                        cy={a.y}
                        r={r + 5}
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="1.2"
                        opacity="0.4"
                        className="animate-ping"
                        style={{ animationDuration: '3s' }}
                      />
                    )}

                    {/* Outer border ring */}
                    <circle
                      cx={a.x}
                      cy={a.y}
                      r={isSelected ? r + 3 : r + 1.5}
                      fill="#0A0F1D"
                      stroke={isSelected ? '#22D3EE' : a.color}
                      strokeWidth={isSelected ? 2.2 : 1.2}
                      filter={a.hub ? 'url(#glow-purple)' : undefined}
                    />

                    {/* Core node dot */}
                    <circle
                      cx={a.x}
                      cy={a.y}
                      r={isSelected ? r + 1 : r}
                      fill={a.color}
                    />

                    {/* Airport 3-Letter Code Label */}
                    <text
                      x={a.x + r + 3}
                      y={a.y + 3}
                      className="font-mono text-[9px] font-bold fill-slate-300 group-hover:fill-cyan-300 transition-colors pointer-events-none"
                    >
                      {a.code}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Real-Time Corridor Inspector Card (Positioned in map corner) */}
        {selectedEntity && (
          <div className="absolute top-3 right-3 bg-[#0D1527]/95 border border-cyan-500/40 rounded-xl p-3 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-xs font-mono max-w-[240px] backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
              <span className="font-extrabold text-cyan-400 text-[11px]">{selectedEntity.code}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                selectedEntity.status === 'CRITICAL_SURGE' 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-blue-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {selectedEntity.status}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Observed Fare:</span>
                <span className="font-bold text-white font-mono">{selectedEntity.fare}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Corridor Index:</span>
                <span className="font-bold text-cyan-400 font-mono">{selectedEntity.index}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>T+1 Surge:</span>
                <span className="font-bold text-red-400 font-mono">{selectedEntity.surge}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/index-apix')}
              className="mt-2.5 w-full py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Analyze in APIx</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Technical Legend (Matching reference screenshot exactly) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono select-none">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span className="text-slate-300">Live Data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></span>
            <span className="text-slate-300">Historical Data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]"></span>
            <span className="text-slate-300">Combined</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
            <span className="text-slate-300">Critical Surge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]"></span>
            <span className="text-slate-400">No Data</span>
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[10px]">
          Click route arc or airport node to open Route Intelligence
        </span>
      </div>
    </div>
  );
};
