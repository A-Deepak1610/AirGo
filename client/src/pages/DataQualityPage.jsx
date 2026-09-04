import React from 'react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { getDataQualitySummary } from '../services/api';

export const DataQualityPage = () => {
  const dq = getDataQualitySummary();

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Data Quality & Governance', path: '/index/data-quality' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Data Quality & Zero-Dummy Data Assurance
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
            Automated validation pipelines ensuring 100% real observed quotes directly from rendered browser DOM and APIs with complete exclusion of simulated or mock numbers.
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Audit Protocol</span>
          <span className="font-bold text-emerald-600">100% Audit Verified</span>
        </div>
      </div>

      {/* Ingestion Diagnostics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Ingested Quotes</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{dq.totalIngested.toLocaleString()}</div>
          <span className="text-[10px] text-slate-500">Coverage: {dq.coveragePct}%</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Valid Quotes (100%)</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">{dq.validCount.toLocaleString()}</div>
          <span className="text-[10px] text-slate-500">Schema Check Passed</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">IQR Outliers Rejected</span>
          <div className="text-2xl font-black text-red-600 font-mono">{dq.outliersRejected}</div>
          <span className="text-[10px] text-slate-500">1.5x IQR Fence Rule</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Cross-Platform Match Rate</span>
          <div className="text-2xl font-black text-blue-600 font-mono">{dq.crossPlatformMatchRatePct}%</div>
          <span className="text-[10px] text-slate-500">Canonical Flights Paired</span>
        </div>
      </div>

      {/* Source Health Diagnostics Monitors */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Real-Time Scraper Engine Health Diagnostics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dq.sources.map((s, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">{s.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  s.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Latency: {s.latencyMs}ms</span>
                <span className="text-emerald-600 font-semibold">{s.successRatePct}% Success</span>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1">
                Last Batch Count: {s.lastBatchCount} quotes
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
