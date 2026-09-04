import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Database,
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { TraceabilityModal } from '../components/analytics/TraceabilityModal';
import { getNationalSummary, getHistoricalTimeSeries, getRouteAnalyticsList } from '../services/api';

export const NationalOverviewPage = () => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState('apix'); // 'apix' | 'laspeyres' | 'jevons' | 'cpi'
  const [timeRange, setTimeRange] = useState('1y');
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);

  const summary = getNationalSummary();
  const timeSeries = getHistoricalTimeSeries();
  const topRoutes = getRouteAnalyticsList().slice(0, 5);

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'National Index Overview', path: '/index/overview' }]} />

      {/* Hero Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            MoSPI & DGCA Official Econometric Series
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Indian Airfare Price Index (APIx)
          </h1>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
            High-frequency index measuring domestic airfare inflation across top 20 DGCA corridors ($T+1$ to $T+45$) weighted by passenger volume ($w_i$).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsTraceModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Trace Lineage</span>
          </button>
          <button
            onClick={() => navigate('/index/methodology')}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Methodology</span>
          </button>
        </div>
      </div>

      {/* Quieter KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: APIx Index */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">APIx Weighted Index</span>
          <div className="text-2xl font-black text-blue-600 font-mono">{summary.currentIndex}</div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{summary.momChange}% MoM (+{summary.yoyInflation}% YoY)
          </div>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">Base Period: {summary.baseYear}</span>
        </div>

        {/* Card 2: YoY Inflation */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">YoY Airfare Inflation</span>
          <div className="text-2xl font-black text-rose-600 font-mono">+{summary.yoyInflation}%</div>
          <div className="text-xs text-slate-500 font-medium">vs Same Month Prev Year</div>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">MoSPI CPI Ref: 112.70</span>
        </div>

        {/* Card 3: Avg Domestic Fare */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Basket Average Fare</span>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{summary.avgFare.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-medium">Clean non-outlier quotes</div>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">Median: ₹{summary.medianFare.toLocaleString()}</span>
        </div>

        {/* Card 4: Covered Corridors */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">DGCA Corridors</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{summary.coveredRoutes} Routes</div>
          <div className="text-xs text-slate-500 font-medium">Top passenger corridors</div>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">Airlines: {summary.activeAirlines} | OTAs: {summary.activePlatforms}</span>
        </div>

        {/* Card 5: Data Ingestion */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Data Coverage</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{summary.dataCoveragePct}%</div>
          <div className="text-xs text-emerald-600 font-bold">{summary.totalObservations.toLocaleString()} quotes scraped</div>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">Audit: 100% Real Live Data</span>
        </div>
      </div>

      {/* Main Interactive Historical Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>National Airfare Price Index (APIx) vs. MoSPI CPI Transport Index</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-frequency real-time index vs lagging monthly physical counter collection.
            </p>
          </div>

          {/* Model & Horizon Selector Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              {[
                { id: 'apix', label: 'APIx Weighted' },
                { id: 'laspeyres', label: 'Laspeyres' },
                { id: 'jevons', label: 'Jevons' },
                { id: 'cpi', label: 'MoSPI CPI Ref' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-2.5 py-1 rounded-md transition-all ${selectedModel === m.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              {['30d', '6m', '1y', '3y'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2 py-1 rounded-md uppercase transition-all ${timeRange === r ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-64 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-100 overflow-x-auto">
          {timeSeries.slice(-12).map((pt, idx) => {
            const val = selectedModel === 'laspeyres' ? pt.laspeyres : selectedModel === 'jevons' ? pt.jevons : selectedModel === 'cpi' ? pt.cpiTransport : pt.apix;
            const heightPct = ((val - 95) / (125 - 95)) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-[36px]">
                <div className="absolute -top-9 bg-slate-900 text-white text-[10px] py-1 px-2 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono shadow-md">
                  {pt.date}: Index {val} ({pt.yoy > 0 ? '+' : ''}{pt.yoy}% YoY)
                </div>
                <div
                  style={{ height: `${Math.max(heightPct, 10)}%` }}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-t-md transition-all relative"
                >
                  <div className="absolute top-1 left-0 right-0 text-[9px] font-bold text-center text-blue-100 font-mono">
                    {val}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-2">{pt.date}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> APIx Weighted Index</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> MoSPI CPI Sub-Index</span>
          </div>
          <span>Updated: {summary.lastUpdated}</span>
        </div>
      </div>

      {/* Top Route Contributors Preview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Top DGCA Corridor Index Contributions</span>
          </h3>
          <button
            onClick={() => navigate('/index/routes')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All 20 Routes →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Corridor</th>
                <th className="py-2.5 px-3 font-semibold">DGCA Weight</th>
                <th className="py-2.5 px-3 font-semibold">Current Index</th>
                <th className="py-2.5 px-3 font-semibold">Average Fare</th>
                <th className="py-2.5 px-3 font-semibold">YoY Inflation</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {topRoutes.map((r, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span>{r.route}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({r.city1} ↔ {r.city2})</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{r.weightPct}%</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{r.index}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-900 font-semibold">₹{r.avgFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">+{r.yoyPct}%</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => navigate(`/index/routes/${r.route}`)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                    >
                      Detail →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traceability Lineage Modal */}
      <TraceabilityModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        initialRoute="DEL-BOM"
        initialIndex={summary.currentIndex}
      />
    </div>
  );
};
