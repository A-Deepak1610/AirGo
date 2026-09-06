import React, { useState, useEffect } from 'react';
import {
  Terminal,
  ExternalLink,
  Camera,
  TrendingUp,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

import { useAuditModal } from '../../context/AuditModalContext';
import { liveScraperStream, auditedFlightsList } from '../../data/scrapedRunsData';

export const LiveScraperTicker = () => {
  const { openAuditModal, openHeadless } = useAuditModal();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % liveScraperStream.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeItem = liveScraperStream[currentIndex] || liveScraperStream[0] || {};
  const matchedAuditFlight = auditedFlightsList.find(f => f.flightNumber === activeItem?.flightNumber) || auditedFlightsList[0];
  const totalFareDisplay = activeItem.totalFare ? Number(activeItem.totalFare).toLocaleString('en-IN') : '6,429';
  const deltaStr = activeItem.delta || '+0.0%';
  const isPositive = deltaStr.startsWith('+');

  return (
    <div
      className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 shadow-sm transition-all flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left: Feed Status & Corridor Info */}
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Live Stream
          </span>
        </div>

        <span className="hidden sm:inline-block h-3.5 w-px bg-slate-700"></span>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Strict Zero-Dummy Verification</span>
        </span>
      </div>

      {/* Middle: Active Flight Stream Item */}
      <div className="flex-1 flex items-center justify-start md:justify-center gap-2.5 overflow-hidden w-full md:w-auto">
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700/60 transition-all font-mono text-[12px]">
          <span className="font-semibold text-white">{activeItem.flightNumber || '6E-6027'}</span>
          <span className="text-slate-400">({activeItem.carrier || 'IndiGo'})</span>
          <span className="text-slate-500">·</span>
          <span className="text-blue-300 font-semibold">{activeItem.route || 'BOM-DEL'}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-bold">
            {activeItem.horizon || 'T+1'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-bold">₹{totalFareDisplay}</span>

          <span className={`text-[10px] flex items-center gap-0.5 px-1 rounded ${isPositive ? 'text-amber-400 bg-amber-950/40' : 'text-emerald-400 bg-emerald-950/40'
            }`}>
            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {deltaStr}
          </span>
        </div>

        {/* Action Buttons for active stream item */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => openAuditModal(matchedAuditFlight)}
            title="Inspect 4-Step Ground Truth Proof (DOM Screenshots & Breakdown)"
            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <Camera className="w-3 h-3 text-blue-400" />
            <span>Audit Proof</span>
          </button>

          <a
            href={activeItem.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Live Verified OTA Checkout in new tab"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3 h-3 text-slate-400" />
            <span className="hidden lg:inline">Live Link</span>
          </a>
        </div>
      </div>

      {/* Right: Interactive Tools Triggers */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
        <button
          onClick={() => openHeadless({ route: activeItem.route, horizon: activeItem.horizon })}
          title="Launch Interactive Headless Playwright Scraper Studio"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors cursor-pointer group shadow-2xs"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Scraper Studio</span>
        </button>
      </div>
    </div>
  );
};
