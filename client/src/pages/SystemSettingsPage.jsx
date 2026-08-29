import React from 'react';
import { Settings, Sliders, Shield, RefreshCw, Database } from 'lucide-react';

export const SystemSettingsPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Settings & Scraper Configuration
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Global parameters for scraping intervals, rate limiting, anti-detection proxy rotation, and database retention policies.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-slate-900">Scraping Engine Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tier 1 Daily Run Time (IST)</label>
              <input type="text" defaultValue="06:00 AM IST" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Browser Headless Concurrency</label>
              <input type="number" defaultValue="4" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-slate-900">DGCA Weight Rebalancing Frequency</h2>
          <p className="text-xs text-slate-500 mt-1">Automatic annual updates when official Table 5.01 domestic statistics are published by DGCA.</p>
        </div>
      </div>
    </div>
  );
};
