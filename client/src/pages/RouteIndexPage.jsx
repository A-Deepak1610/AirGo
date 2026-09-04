import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { RouteHeatmapGrid } from '../components/analytics/RouteHeatmapGrid';
import { getRouteAnalyticsList } from '../services/api';

export const RouteIndexPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'heatmap'
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('weight'); // 'weight' | 'yoy' | 'fare' | 'index' | 'volatility'

  const routes = getRouteAnalyticsList();

  const filteredRoutes = routes
    .filter(r => {
      const matchesSearch = r.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.city1.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.city2.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = tierFilter === 'ALL' || r.tier === tierFilter;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      if (sortBy === 'yoy') return b.yoyPct - a.yoyPct;
      if (sortBy === 'fare') return b.avgFare - a.avgFare;
      if (sortBy === 'index') return b.index - a.index;
      if (sortBy === 'volatility') return b.volatilityScore - a.volatilityScore;
      return b.weightWithinBasket - a.weightWithinBasket;
    });

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Route Index & Heatmap', path: '/index/routes' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            DGCA Top Corridor Airfare Indices
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Corridor-level price indices, advance booking window matrices, and DGCA passenger volume weights ($w_i$).
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'table' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rankings Table
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'heatmap' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Regional Heatmap
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search corridor or city pair (e.g. DEL-BOM, Bengaluru)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2"
          >
            <option value="ALL">All Metro Tiers</option>
            <option value="Metro-Metro">Metro-Metro</option>
            <option value="Metro-Tier2">Metro-Tier2</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2"
          >
            <option value="weight">Sort by DGCA Weight</option>
            <option value="yoy">Sort by YoY Inflation</option>
            <option value="fare">Sort by Avg Fare</option>
            <option value="index">Sort by Route Index</option>
            <option value="volatility">Sort by Volatility</option>
          </select>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'heatmap' ? (
        <RouteHeatmapGrid />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">Rank & Route</th>
                  <th className="py-2.5 px-3 font-semibold">City Pair</th>
                  <th className="py-2.5 px-3 font-semibold">DGCA Weight</th>
                  <th className="py-2.5 px-3 font-semibold">Route Index</th>
                  <th className="py-2.5 px-3 font-semibold">Avg Fare (T+15)</th>
                  <th className="py-2.5 px-3 font-semibold">YoY Inflation</th>
                  <th className="py-2.5 px-3 font-semibold">T+1 Urgent Surge</th>
                  <th className="py-2.5 px-3 font-semibold font-mono">Volatility (σ)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((r) => (
                  <tr key={r.route} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">#{r.rank}</span>
                      <span className="text-blue-600 font-mono">{r.route}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{r.city1} ↔ {r.city2}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{r.weightPct}%</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{r.index}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">₹{r.avgFare.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">+{r.yoyPct}%</td>
                    <td className="py-2.5 px-3 font-mono text-amber-600 font-bold">+{r.t1SurgePct}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">σ {r.volatilityScore}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate(`/index/routes/${r.route}`)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                      >
                        Deep-Dive →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
