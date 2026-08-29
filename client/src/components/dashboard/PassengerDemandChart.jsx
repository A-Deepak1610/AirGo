import React from 'react';
import { PASSENGER_DEMAND_DATA } from '../../config/dashboardData';
import { Info } from 'lucide-react';

export const PassengerDemandChart = () => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Passenger Demand by Route
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <span>Source: DGCA Scheduled Domestic Passenger Traffic</span>
            <Info className="w-3 h-3 text-slate-400 cursor-help" />
          </p>
        </div>

        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase border border-slate-200/60">
          ANNUAL - FY 2025-26
        </span>
      </div>

      {/* Horizontal Demand Bars */}
      <div className="space-y-2.5">
        {PASSENGER_DEMAND_DATA.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 text-xs">
            <span className="w-40 text-[11px] font-semibold text-slate-700 shrink-0">
              {item.route}
            </span>

            <div className="flex-1 bg-slate-100 rounded-xs h-3.5 overflow-hidden flex items-center">
              <div
                style={{ width: `${item.widthPct}%` }}
                className="bg-blue-600 h-full rounded-xs transition-all duration-300"
              ></div>
            </div>

            <span className="w-12 text-right text-[11px] font-extrabold text-slate-900 shrink-0">
              {item.volume}
            </span>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Passenger traffic is used to calculate route-level demand weights for the airfare index.</span>
      </div>
    </div>
  );
};
