import React from 'react';
import { PASSENGER_DEMAND_DATA } from '../../config/dashboardData';
import { Info } from 'lucide-react';

export const PassengerDemandChart = ({ onNavigateDemand }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#111827] tracking-tight">
            Passenger Demand by Route
          </h2>
          <p className="text-xs sm:text-[13px] font-normal text-[#4B5563] mt-0.5 flex items-center gap-1">
            <span>Source: DGCA Scheduled Domestic Passenger Traffic</span>
            <Info className="w-3 h-3 text-[#6B7280] cursor-help" />
          </p>
        </div>

        <button
          onClick={onNavigateDemand}
          className="bg-slate-100 hover:bg-slate-200 text-[#4B5563] hover:text-[#111827] text-[13px] font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          Annual (FY 2024–25) · View All 100
        </button>
      </div>

      {/* Horizontal Demand Bars */}
      <div className="space-y-2.5">
        {PASSENGER_DEMAND_DATA.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 text-xs">
            <span className="w-40 text-xs font-medium font-mono text-[#111827] shrink-0">
              {item.route}
            </span>

            <div className="flex-1 bg-slate-100 rounded-xs h-3.5 overflow-hidden flex items-center">
              <div
                style={{ width: `${item.widthPct}%` }}
                className="bg-blue-600 h-full rounded-xs transition-all duration-300"
              ></div>
            </div>

            <span className="w-12 text-right text-xs font-semibold font-mono tabular-nums text-[#111827] shrink-0">
              {item.volume}
            </span>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-[#6B7280]">
        <Info className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
        <span>Passenger traffic is used to calculate route-level demand weights for the airfare index.</span>
      </div>
    </div>
  );
};
