import React from 'react';
import { Layers } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { getMethodologyDocs, getRouteAnalyticsList } from '../services/api';

export const MethodologyPage = () => {
  const docs = getMethodologyDocs();
  const routes = getRouteAnalyticsList();

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Index Methodology & Formulas', path: '/index/methodology' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {docs.title}
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-3xl leading-relaxed mt-1">
              Standardized statistical methodology compliant with MoSPI Consumer Price Index guidelines, DGCA passenger density weights, and international Fisher-Jevons index aggregation standards.
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Specification</span>
            <span className="font-mono font-bold text-slate-800">Version {docs.version}</span>
          </div>
        </div>
      </div>

      {/* 8-Step Visual Calculation Pipeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-slate-900">
          End-to-End Statistical Calculation Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {docs.pipelineSteps.map((step) => (
            <div key={step.step} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 relative">
              <div className="w-6 h-6 rounded bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center font-mono">
                {step.step}
              </div>
              <h3 className="text-xs font-bold text-slate-900">{step.name}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Index Formulas Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Index Formulas & Econometric Formulations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.formulas.map((f, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900">{f.name}</span>
              <div className="p-3 bg-white rounded border border-slate-200 font-mono text-emerald-700 text-xs font-bold text-center shadow-2xs">
                {f.formula}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DGCA Basket Weighting Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>DGCA Official Corridor Passenger Traffic Weights ($w_i$)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Corridor Route</th>
                <th className="py-2.5 px-3 font-semibold">City Pair</th>
                <th className="py-2.5 px-3 font-semibold">Annual Passenger Volume</th>
                <th className="py-2.5 px-3 font-semibold">Basket Weight ($w_i$)</th>
                <th className="py-2.5 px-3 font-semibold">National Traffic Share</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.route} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-400">#{r.rank}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600 font-mono">{r.route}</td>
                  <td className="py-2.5 px-3 text-slate-700">{r.city1} ↔ {r.city2}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-900">{r.totalPax.toLocaleString()} pax</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{r.weightPct}%</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{r.nationalPaxSharePct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
