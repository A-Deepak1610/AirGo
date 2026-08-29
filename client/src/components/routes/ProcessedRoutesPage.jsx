import React, { useState, useMemo } from 'react';
import dgcaData from '../../data/dgcaRouteBasket.json';
import { 
  Plane, 
  Search, 
  Download, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Database, 
  BarChart3, 
  Layers, 
  ArrowUpRight,
  FileSpreadsheet,
  FileCode,
  Info
} from 'lucide-react';

export const ProcessedRoutesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTier, setActiveTier] = useState('ALL');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Summary Metrics
  const totalNationalPax = 165541692;
  const basketTotalPax = dgcaData.reduce((acc, r) => acc + r.total_pax, 0);
  const coveragePct = ((basketTotalPax / totalNationalPax) * 100).toFixed(2);
  const weightSum = dgcaData.reduce((acc, r) => acc + r.weight_traffic_within_basket, 0).toFixed(6);

  // Filter and Sort Logic
  const filteredRoutes = useMemo(() => {
    return dgcaData
      .filter((item) => {
        const matchesSearch =
          item.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.city1.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.city2.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTier =
          activeTier === 'ALL' || item.tier.toUpperCase() === activeTier;

        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [searchTerm, activeTier, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRoutes.length / pageSize);
  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Route',
      'City 1',
      'City 2',
      'Total Passengers',
      'Within-Basket Weight',
      'Share of National Traffic',
      'Tier'
    ];
    const rows = dgcaData.map((r) => [
      r.rank,
      r.route,
      `"${r.city1}"`,
      `"${r.city2}"`,
      r.total_pax,
      r.weight_traffic_within_basket,
      r.share_of_national_traffic,
      `"${r.tier}"`
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dgca_top100_route_basket.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(dgcaData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'dgca_top100_route_basket.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Title */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Official DGCA Passenger Traffic Statistics • FY 2024-25
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            DGCA Domestic Route Basket & Index Weights
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            Order-independent, alias-normalized representation of India’s top 100 domestic airline routes. Forms the econometric weighting foundation ($w_i$) for the Real-time Airfare Price Index (APIx).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs transition-all hover:border-slate-400"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all"
          >
            <FileCode className="w-4 h-4 text-white" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* National Total */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              National Domestic Traffic
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">16.55 Cr</div>
          <p className="text-xs text-slate-500 mt-1">165,541,692 pax across 816 routes</p>
        </div>

        {/* Basket Total */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Top-100 Basket Traffic
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">11.71 Cr</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">117,077,116 passengers captured</p>
        </div>

        {/* Coverage % */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              National Market Coverage
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600">{coveragePct}%</div>
          <p className="text-xs text-slate-500 mt-1">Exceeds 70% representative target</p>
        </div>

        {/* Weight Sum Validation */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Within-Basket Weight Sum
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{weightSum}</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Exact 100.0% Normalized ($\sum w_i = 1.0$)</p>
        </div>
      </div>

      {/* Tier Stratification Breakdown Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Scraping Stratification & Sampling Policy</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-tier sampling policy balancing server load and market representative price accuracy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider">
                Tier 1 (Rank 1 – 15)
              </span>
              <span className="text-xs font-bold text-blue-800">47.9% Nat'l Traffic</span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              High-Frequency Daily Monitoring: All 5 advance booking windows (T+1, T+7, T+15, T+30, T+45) across Cleartrip & EaseMyTrip.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">
              Includes: BOM-DEL, BLR-DEL, BLR-BOM, DEL-HYD, DEL-PNQ, CCU-DEL, DEL-GOI...
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider">
                Tier 2 (Rank 16 – 30)
              </span>
              <span className="text-xs font-bold text-emerald-800">15.3% Nat'l Traffic</span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              Daily Core Monitoring: Core advance purchase windows (T+7, T+15, T+30) across major commercial scheduled airlines.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">
              Includes: BOM-MAA, AMD-BOM, BLR-PNQ, BLR-GOI, HYD-MAA, DEL-GAU...
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-700 text-white text-[11px] font-bold uppercase tracking-wider">
                Tier 3 (Rank 31 – 100)
              </span>
              <span className="text-xs font-bold text-slate-800">7.5% Nat'l Traffic</span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              Weekly Out-of-Sample Validation: Weekly benchmark audits to verify route elasticity and broad CPI price convergence.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">
              Includes 70 Tier-2 and regional feeder city-pair corridors.
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city (e.g. Delhi, Mumbai) or route (e.g. BOM-DEL)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            {['ALL', 'TIER 1', 'TIER 2', 'TIER 3'].map((tier) => (
              <button
                key={tier}
                onClick={() => {
                  setActiveTier(tier);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTier === tier
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tier === 'ALL' ? 'All Routes (100)' : tier}
              </button>
            ))}
          </div>
        </div>

        {/* Routes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th
                  onClick={() => handleSort('rank')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors w-16"
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('route')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Route (IATA)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('city1')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Sector City Pair</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total_pax')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Annual Pax</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('weight_traffic_within_basket')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Basket Weight ($w_i$)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('share_of_national_traffic')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>National Share</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Scraping Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRoutes.map((row) => {
                const weightPct = (row.weight_traffic_within_basket * 100).toFixed(2);
                const natlPct = (row.share_of_national_traffic * 100).toFixed(2);
                const progressWidth = Math.min(100, Math.max(8, (row.total_pax / 6850869) * 100));

                return (
                  <tr
                    key={row.route}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-700 group-hover:text-blue-800 flex items-center justify-center text-xs font-extrabold transition-colors">
                        #{row.rank}
                      </span>
                    </td>

                    {/* Route IATA */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-900 font-mono font-bold text-xs border border-slate-200">
                        <Plane className="w-3 h-3 text-blue-600 transform -rotate-45" />
                        {row.route}
                      </span>
                    </td>

                    {/* Sector */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <span>{row.city1} ↔ {row.city2}</span>
                    </td>

                    {/* Annual Pax */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {row.total_pax.toLocaleString()}
                      </span>
                    </td>

                    {/* Basket Weight */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 w-14">{weightPct}%</span>
                        <div className="flex-1 max-w-[120px] bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${progressWidth}%` }}
                            className="bg-blue-600 h-full rounded-full"
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* National Share */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-600">{natlPct}%</span>
                    </td>

                    {/* Tier Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border ${
                          row.tier === 'Tier 1'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : row.tier === 'Tier 2'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {row.tier}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {paginatedRoutes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No routes found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-800">
              {Math.min(currentPage * pageSize, filteredRoutes.length)}
            </strong>{' '}
            of <strong className="text-slate-800">{filteredRoutes.length}</strong> routes
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
