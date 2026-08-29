import React from 'react';
import { History, Calendar, TrendingUp, Download } from 'lucide-react';
import { HistoricalTrendChart } from '../components/dashboard/HistoricalTrendChart';

export const HistoricalDataPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Historical Airfare & CPI Data Archive
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Multi-year historical time series tracking Indian domestic airfares, seasonal elasticity curves, and CPI transport inflation indices.
        </p>
      </div>

      <HistoricalTrendChart />
    </div>
  );
};
