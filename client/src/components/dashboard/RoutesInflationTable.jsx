import React from 'react';
import { ROUTES_INFLATION_DATA } from '../../config/dashboardData';
import { ArrowRight } from 'lucide-react';

export const RoutesInflationTable = ({ onNavigateRoutes }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div>
          <h2 className="text-base font-semibold text-[#111827] tracking-tight">
            Routes Driving Airfare Inflation
          </h2>
          <p className="text-xs sm:text-[13px] font-normal text-[#4B5563] mt-0.5">
            Ranked by index contribution – August 2026
          </p>
        </div>

        <button
          onClick={onNavigateRoutes}
          className="text-blue-600 hover:text-blue-700 text-[13px] font-medium flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>View All 100 Routes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-[#6B7280]">
              <th className="py-2.5 font-medium">Route</th>
              <th className="py-2.5 font-medium">Passengers</th>
              <th className="py-2.5 font-medium">Avg Fare</th>
              <th className="py-2.5 font-medium">MoM Change</th>
              <th className="py-2.5 font-medium">Index Contribution</th>
              <th className="py-2.5 font-medium text-right">Demand Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[#4B5563] font-normal">
            {ROUTES_INFLATION_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                {/* Route */}
                <td className="py-3 font-medium font-mono text-[13px] text-[#111827]">
                  <span>{row.origin} ↔ {row.destination}</span>
                </td>

                {/* Passengers */}
                <td className="py-3 text-[#4B5563] font-mono tabular-nums text-xs">
                  {row.passengers}
                </td>

                {/* Avg Fare */}
                <td className="py-3 font-medium font-mono tabular-nums text-[13px] text-[#111827]">
                  {row.avgFare}
                </td>

                {/* MoM Change with mini progress bar */}
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium font-mono tabular-nums text-xs text-emerald-600 w-12">{row.momChange}</span>
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
                    <span className="font-medium font-mono tabular-nums text-xs text-[#111827] w-16">{row.indexContribution}</span>
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
                  <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-medium font-mono px-2 py-0.5 rounded">
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
