import React from 'react';
import { Layers } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { getNationalSummary, getRouteAnalyticsList } from '../services/api';

export const InflationPage = () => {
  const summary = getNationalSummary();
  const routes = getRouteAnalyticsList();

  const sortedByInflation = [...routes].sort((a, b) => b.yoyPct - a.yoyPct);

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Airfare Inflation Workspace', path: '/index/inflation' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Airfare Tariff Inflation & Sector Decomposition
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Measuring Year-on-Year (YoY), Month-on-Month (MoM), and Week-on-Week (WoW) inflation contributions by route and advance window.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[100px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">YoY Inflation</span>
            <span className="text-xl font-black text-rose-600 font-mono">+{summary.yoyInflation}%</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[100px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">MoM Inflation</span>
            <span className="text-xl font-black text-amber-600 font-mono">+{summary.momChange}%</span>
          </div>
        </div>
      </div>

      {/* Route Contribution Breakdown Bars */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>Sector Inflation Contribution Breakdown (Top Drivers)</span>
        </h3>

        <div className="space-y-3">
          {sortedByInflation.slice(0, 8).map((r) => {
            const contributionPoints = parseFloat((r.weightWithinBasket * r.yoyPct).toFixed(2));
            const barWidthPct = Math.min((r.yoyPct / 15) * 100, 100);

            return (
              <div key={r.route} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-900 font-mono">{r.route} ({r.city1} ↔ {r.city2})</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px]">Weight: {r.weightPct}%</span>
                    <span className="font-mono text-emerald-600 font-bold">+{r.yoyPct}% YoY</span>
                    <span className="font-mono text-blue-600 font-bold">+{contributionPoints} pts</span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex">
                  <div style={{ width: `${barWidthPct}%` }} className="h-full bg-blue-600 rounded-full" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inflation by Advance Window Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Inflation Rate Disaggregation by Booking Window Horizon
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { window: 'T+1 Urgent', yoy: '+14.2%', mom: '+3.8%' },
            { window: 'T+7 Short-Notice', yoy: '+8.4%', mom: '+2.1%' },
            { window: 'T+15 Core Window', yoy: '+3.72%', mom: '+1.85%' },
            { window: 'T+30 Advance', yoy: '+2.1%', mom: '+0.8%' },
            { window: 'T+45 Leisure Base', yoy: '+1.4%', mom: '+0.4%' }
          ].map((w, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{w.window}</span>
              <div className="text-xl font-black font-mono text-slate-900">{w.yoy} YoY</div>
              <span className="text-[11px] font-semibold text-slate-600 block">{w.mom} MoM</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
