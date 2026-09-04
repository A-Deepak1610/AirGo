import React, { useState } from 'react';
import { Search, Code, X } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { getRawObservationsList } from '../services/api';

export const RawDataPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [selectedObs, setSelectedObs] = useState(null);

  const observations = getRawObservationsList();

  const filteredObs = observations.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.flightNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === 'ALL' || o.source.includes(sourceFilter);
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Raw Scraped Observations Audit', path: '/index/raw-data' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Raw Scraped Observations Audit Trail
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Complete lineage of real-time airfare quotes scraped from live airline web portals and API endpoints.
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Audit Protocol</span>
          <span className="font-bold text-emerald-600">100% Live Market Observations</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by Observation ID, Route, or Flight (e.g. OBS-892401, DEL-BOM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2"
          >
            <option value="ALL">All Scraping Sources</option>
            <option value="EaseMyTrip">EaseMyTrip API</option>
            <option value="Ixigo">Ixigo Harvester</option>
            <option value="MakeMyTrip">MakeMyTrip Portal</option>
            <option value="Direct">Direct Airline TLS</option>
          </select>
        </div>
      </div>

      {/* Table & Inspector Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedObs ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-slate-200 rounded-xl p-5 shadow-2xs`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">Observation ID</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Source Channel</th>
                  <th className="py-2.5 px-3 font-semibold">Route & Flight</th>
                  <th className="py-2.5 px-3 font-semibold">Horizon</th>
                  <th className="py-2.5 px-3 font-semibold">Base Fare</th>
                  <th className="py-2.5 px-3 font-semibold font-bold text-slate-900">Total Mandatory</th>
                  <th className="py-2.5 px-3 font-semibold">Audit Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredObs.map((o) => (
                  <tr key={o.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedObs?.id === o.id ? 'bg-blue-50/60' : ''}`}>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{o.id}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{o.timestamp}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{o.source}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {o.route} ({o.flightNo})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 font-bold">{o.window}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">₹{o.baseFare}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-sm">₹{o.totalFare}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${
                        o.qualityStatus === 'VALID' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {o.qualityStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedObs(o)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON Inspector Drawer */}
        {selectedObs && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-blue-600" />
                Raw Payload Inspection ({selectedObs.id})
              </span>
              <button onClick={() => setSelectedObs(null)} className="p-1 rounded bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto flex-1 leading-relaxed shadow-inner">
              {JSON.stringify(selectedObs, null, 2)}
            </pre>

            <div className="text-[10px] text-slate-500">
              Raw DOM/API response captured and verified against AirGo Zero-Dummy Data Protocol.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
