import React from 'react';
import { ROUTES_INFLATION_DATA } from '../../config/dashboardData';
import { ArrowRight } from 'lucide-react';

export const RoutesInflationTable = ({ onNavigateRoutes }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Routes Driving Airfare Inflation
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Ranked by index contribution – August 2026
          </p>
        </div>

        <button
          onClick={onNavigateRoutes}
          className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>View All 100 Routes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
              <th className="py-2.5 font-bold">Route</th>
              <th className="py-2.5 font-bold">Passengers</th>
              <th className="py-2.5 font-bold">Avg Fare</th>
              <th className="py-2.5 font-bold">MoM Change</th>
              <th className="py-2.5 font-bold">Index Contribution</th>
              <th className="py-2.5 font-bold text-right">Demand Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
            {ROUTES_INFLATION_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                {/* Route */}
                <td className="py-3 font-bold text-slate-900">
                  <span>{row.origin} ↔ {row.destination}</span>
                </td>

                {/* Passengers */}
                <td className="py-3 text-slate-600 font-mono text-[11px]">
                  {row.passengers}
                </td>

                {/* Avg Fare */}
                <td className="py-3 font-bold text-slate-900">
                  {row.avgFare}
                </td>

                {/* MoM Change with mini progress bar */}
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600 w-12">{row.momChange}</span>
                    <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${row.momProgress}%` }}
                        className="bg-emerald-500 h-full rounded-full"
                      ></div>
                    </div>
                  </div>
                </td>

                {/* Index Contribution with blue progress bar */}
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 w-16">{row.indexContribution}</span>
                    <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${row.contributionProgress}%` }}
                        className="bg-blue-600 h-full rounded-full"
                      ></div>
                    </div>
                  </div>
                </td>

                {/* Demand Weight Badge */}
                <td className="py-3 text-right">
                  <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[11px] font-bold px-2 py-0.5 rounded">
                    {row.demandWeight}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
