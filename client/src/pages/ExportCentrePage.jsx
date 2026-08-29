import React from 'react';
import { Download, FileSpreadsheet, FileCode, Database, CheckCircle2 } from 'lucide-react';
import dgcaData from '../data/dgcaRouteBasket.json';

export const ExportCentrePage = () => {
  const handleExportRoutesCSV = () => {
    const headers = ['Rank', 'Route', 'City 1', 'City 2', 'Total Pax', 'Basket Weight', 'National Share', 'Tier'];
    const rows = dgcaData.map((r) => [r.rank, r.route, `"${r.city1}"`, `"${r.city2}"`, r.total_pax, r.weight_traffic_within_basket, r.share_of_national_traffic, `"${r.tier}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = 'dgca_top100_route_basket.csv';
    link.click();
  };

  const handleExportRoutesJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dgcaData, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = 'dgca_top100_route_basket.json';
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Data Export Centre
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Export raw quotes, calculated airfare price indices, and official DGCA traffic weight datasets in standard open formats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Top-100 DGCA Route Basket</h3>
            <p className="text-xs text-slate-500 mt-1">Full 100-route dataset with normalized city names, IATA pairs, annual passengers, and within-basket weights.</p>
          </div>
          <button
            onClick={handleExportRoutesCSV}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 w-fit mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">JSON Route Basket Feed</h3>
            <p className="text-xs text-slate-500 mt-1">Structured JSON feed optimized for direct ingestion into econometric CPI calculators.</p>
          </div>
          <button
            onClick={handleExportRoutesJSON}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 w-fit mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Monthly APIx Time Series</h3>
            <p className="text-xs text-slate-500 mt-1">Historical monthly index numbers from January 2026 to present across advance booking horizons.</p>
          </div>
          <button
            onClick={handleExportRoutesCSV}
            className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Index Pack</span>
          </button>
        </div>
      </div>
    </div>
  );
};
