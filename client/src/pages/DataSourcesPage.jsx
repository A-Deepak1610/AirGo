import React from 'react';
import { Database, CheckCircle2, RefreshCw, Activity, Globe, ShieldCheck } from 'lucide-react';

export const DataSourcesPage = () => {
  const sources = [
    { name: 'Cleartrip OTA Scraper', type: 'Playwright Chromium (Headless)', status: 'ACTIVE', quotesToday: '42,850', latency: '2.4s', health: '100% OK' },
    { name: 'EaseMyTrip OTA Scraper', type: 'Playwright Chromium (Headless)', status: 'ACTIVE', quotesToday: '38,120', latency: '3.1s', health: '100% OK' },
    { name: 'Google Flights Aggregator', type: 'API & DOM Mirror', status: 'ACTIVE', quotesToday: '54,600', latency: '1.8s', health: '99.8% OK' },
    { name: 'IndiGo Direct (6E)', type: 'Airline Direct Portal', status: 'STANDBY', quotesToday: '12,400', latency: '4.2s', health: '98.5% OK' },
    { name: 'Air India Direct (AI)', type: 'Airline Direct Portal', status: 'STANDBY', quotesToday: '8,900', latency: '3.9s', health: '99.0% OK' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Live Data Sources & Connector Health
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Multi-source automated web scraping and direct airline data ingestion pipelines feeding the national airfare CPI database.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((s, idx) => (
          <div key={idx} className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{s.name}</h3>
                  <p className="text-[10px] text-slate-400">{s.type}</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Quotes Today</span>
                <p className="font-mono font-bold text-slate-800">{s.quotesToday}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Latency</span>
                <p className="font-mono font-bold text-slate-800">{s.latency}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600 font-medium">
              <span>Connector Health</span>
              <span className="font-bold text-emerald-600">{s.health}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
