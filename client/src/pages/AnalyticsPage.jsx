import React, { useState } from 'react';
import { 
  Compass,
  Download,
  Plane
} from 'lucide-react';
import { routeAnalyticsList } from '../data/analyticsData';
import { LeadTimeCurveChart } from '../components/analytics/LeadTimeCurveChart';
import { PriceDistributionChart } from '../components/analytics/PriceDistributionChart';
import { PlatformComparisonTable } from '../components/analytics/PlatformComparisonTable';
import { PageHeader } from '../components/layout/PageHeader';

export const AnalyticsPage = () => {
  const [selectedRouteCode, setSelectedRouteCode] = useState('DEL-BOM');

  const activeRoute = routeAnalyticsList.find(r => r.route === selectedRouteCode) || routeAnalyticsList[0];

  // Corridor volatility ranking (sorted by volatility score)
  const volatilityRanking = [...routeAnalyticsList].sort((a, b) => b.volatilityScore - a.volatilityScore);

  const handleExport = () => {
    const reportData = {
      corridor: activeRoute.route,
      corridorName: activeRoute.name,
      volatilityScore: activeRoute.volatilityScore,
      windows: activeRoute.windows,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `analytics_corridor_${activeRoute.route}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans animate-in fade-in duration-200">
      {/* 1. Standard Reusable PageHeader */}
      <PageHeader
        title="Advance Purchase & Volatility Analytics"
        description="Econometric lead-time curves (T+1 to T+45), price dispersion quantiles, corridor volatility ranking, and OTA convenience fee spreads."
        actions={
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Analytics Audit
          </button>
        }
        filters={
          <div className="flex items-center justify-between gap-3 flex-wrap w-full text-xs">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Plane className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Selected Corridor:</span>
              <select
                value={selectedRouteCode}
                onChange={(e) => setSelectedRouteCode(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {routeAnalyticsList.map(r => (
                  <option key={r.route} value={r.route}>
                    {r.route} — {r.name || `${r.city1} ↔ ${r.city2}`}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              DGCA Rank #{activeRoute.rank || 1} · {activeRoute.trafficWeightPct}% Traffic Basket Weight
            </span>
          </div>
        }
      />

      {/* 4 KPI Stat Badges for Selected Route */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">T+1 Urgent Surge</p>
          <p className="text-2xl font-black text-red-600 mt-1 font-mono">
            +{activeRoute.t1SurgePct}%
          </p>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg: <span className="font-bold text-slate-800 font-mono">₹{activeRoute.windows['T+1'].avgFare.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">T+45 Baseline Fare</p>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            ₹{activeRoute.windows['T+45'].avgFare.toLocaleString()}
          </p>
          <div className="text-[11px] text-slate-500 mt-1">
            Leisure baseline inventory rate
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Volatility Index (σ)</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {activeRoute.volatilityScore}
          </p>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {activeRoute.volatilityScore > 4.0 ? 'High Dynamic Price Fluctuations' : 'Moderate Dynamic Pricing'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Traffic Basket Weight</p>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
            {activeRoute.trafficWeightPct}%
          </p>
          <div className="text-[11px] text-slate-500 mt-1">
            {activeRoute.annualPaxM}M annual passengers
          </div>
        </div>
      </div>

      {/* Section 1: Lead-Time Elasticity Curve */}
      <LeadTimeCurveChart 
        routeCode={selectedRouteCode} 
        windowData={activeRoute.windows} 
      />

      {/* Section 2: Statistical Price Distribution Histogram */}
      <PriceDistributionChart 
        routeCode={selectedRouteCode} 
      />

      {/* Section 3: Corridor Volatility Ranking Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              Domestic Corridors — Volatility & Price Dispersion Ranking
            </h2>
            <p className="text-xs text-slate-500">
              Corridors ordered by price fluctuation volatility (σ), standard deviation, and urgent booking surge multipliers.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Ordered by Volatility Index (Highest to Lowest)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold">
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">Corridor Code</th>
                <th className="py-2.5 px-4">Sector Description</th>
                <th className="py-2.5 px-4 font-mono">Mean Fare (₹)</th>
                <th className="py-2.5 px-4 font-mono">T+1 Surge Multiplier</th>
                <th className="py-2.5 px-4 font-mono font-bold text-slate-900">Volatility Score (σ)</th>
                <th className="py-2.5 px-4 font-mono">YoY Shift</th>
                <th className="py-2.5 px-4 text-right">Risk Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {volatilityRanking.map((r, idx) => (
                <tr 
                  key={r.route} 
                  onClick={() => setSelectedRouteCode(r.route)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    r.route === selectedRouteCode ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{r.route}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{r.name || `${r.city1} ↔ ${r.city2}`}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">₹{(r.currentFare || r.avgFare || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-red-600 font-semibold">
                    +{r.t1SurgePct}%
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                    {r.volatilityScore}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-600">
                    +{r.yoyPct}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      r.volatilityScore > 4.2
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : r.volatilityScore > 3.2
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {r.volatilityScore > 4.2 ? 'HIGH VOLATILITY' : r.volatilityScore > 3.2 ? 'MODERATE' : 'STABLE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Platform & OTA Comparison */}
      <PlatformComparisonTable />
    </div>
  );
};
