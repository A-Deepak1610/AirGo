import React from 'react';
import { Layers } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { PlatformComparisonTable } from '../components/analytics/PlatformComparisonTable';
import { getPlatformAnalyticsList } from '../services/api';

export const PlatformAnalyticsPage = () => {
  const platforms = getPlatformAnalyticsList();

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Cross-Platform Price Analysis', path: '/index/platforms' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cross-Platform Fare & Fee Spread Audit
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Analyzing price dispersion, OTA convenience fees, and direct airline vs aggregator spreads for canonical flight products.
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Audit Protocol</span>
          <span className="font-bold text-emerald-600">100% Verified Scraped Quotes</span>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {platforms.map((p) => (
          <div key={p.platform} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-900">{p.platform}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${
                p.type === 'Direct' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {p.type}
              </span>
            </div>

            <div className="text-xl font-black text-slate-900 font-mono">₹{p.totalFare.toLocaleString()}</div>

            <div className="text-[11px] space-y-1 text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Convenience Fee:</span>
                <span className="font-mono font-bold text-amber-700">₹{p.avgConvenienceFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Spread vs Direct:</span>
                <span className="font-mono font-bold text-emerald-700">+{p.diffFromDirect === 0 ? '0' : `₹${p.diffFromDirect}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Matching Rate:</span>
                <span className="font-mono font-semibold text-slate-800">{p.matchRatePct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Fee & Price Dispersion Audit Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>Detailed Platform Tariff & Mandatory Fee Breakdown Table</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Distribution Channel</th>
                <th className="py-2.5 px-3 font-semibold">Average Quote</th>
                <th className="py-2.5 px-3 font-semibold">Median Quote</th>
                <th className="py-2.5 px-3 font-semibold">Avg Convenience Fee</th>
                <th className="py-2.5 px-3 font-semibold">Diff vs Direct Airline</th>
                <th className="py-2.5 px-3 font-semibold">Canonical Match Rate</th>
                <th className="py-2.5 px-3 font-semibold">Observations Count</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Price Dispersion (σ)</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr key={p.platform} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span>{p.platform}</span>
                    {p.type === 'Direct' && <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">Baseline</span>}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">₹{p.totalFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">₹{p.medianFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">₹{p.avgConvenienceFee}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">+{p.diffFromDirect === 0 ? '₹0 (Direct)' : `₹${p.diffFromDirect}`}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">{p.matchRatePct}%</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{p.observations.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">±₹{p.dispersionStdDev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Live Canonical Flight Platform Comparison */}
      <PlatformComparisonTable />
    </div>
  );
};
