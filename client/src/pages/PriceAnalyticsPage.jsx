import React from 'react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { PriceDistributionChart } from '../components/analytics/PriceDistributionChart';
import { getRouteAnalyticsList } from '../services/api';

export const PriceAnalyticsPage = () => {
  const routes = getRouteAnalyticsList();

  const sortedByVol = [...routes].sort((a, b) => b.volatilityScore - a.volatilityScore);
  const mostVolatile = sortedByVol.slice(0, 5);
  const leastVolatile = [...sortedByVol].reverse().slice(0, 5);

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Price Analytics & Volatility', path: '/index/price-analytics' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Airfare Statistical Distribution & Volatility Engine
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Empirical probability density functions, standard deviations ($\sigma$), interquartile ranges (IQR), and volatility rankings.
          </p>
        </div>
      </div>

      {/* Embed Interactive Price Distribution Histogram */}
      <PriceDistributionChart routeCode="DEL-BOM" />

      {/* Volatility Rankings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Volatile Routes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Top 5 Most Volatile Corridors (High σ)
          </h3>

          <div className="space-y-2">
            {mostVolatile.map((r) => (
              <div key={r.route} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{r.route}</span>
                    <span className="text-slate-500 text-[11px]">({r.city1} ↔ {r.city2})</span>
                  </div>
                  <div className="text-slate-500">Avg Fare: ₹{r.avgFare.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-red-600 font-mono">σ {r.volatilityScore}</span>
                  <span className="text-[10px] text-slate-500 block">Surge: +{r.t1SurgePct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Least Volatile Routes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Top 5 Most Stable Corridors (Low σ)
          </h3>

          <div className="space-y-2">
            {leastVolatile.map((r) => (
              <div key={r.route} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{r.route}</span>
                    <span className="text-slate-500 text-[11px]">({r.city1} ↔ {r.city2})</span>
                  </div>
                  <div className="text-slate-500">Avg Fare: ₹{r.avgFare.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-600 font-mono">σ {r.volatilityScore}</span>
                  <span className="text-[10px] text-slate-500 block">Surge: +{r.t1SurgePct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
