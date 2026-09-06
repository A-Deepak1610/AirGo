import React from 'react';
import { FARE_PRESSURE_DATA } from '../../config/dashboardData';

export const FarePressureGauge = () => {
  const { highPressure, moderate, stable, declining, totalMonitored } = FARE_PRESSURE_DATA;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-[#111827] tracking-tight">
            Fare Pressure
          </h2>
          <p className="text-xs sm:text-[13px] font-normal text-[#4B5563] mt-0.5">
            Route classification – August 2026
          </p>
        </div>

        {/* Segmented Distribution Bar */}
        <div className="mt-4">
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            <div
              style={{ width: `${highPressure.pct}%` }}
              className="bg-red-500 h-full"
              title={`High Pressure: ${highPressure.pct}%`}
            ></div>
            <div
              style={{ width: `${moderate.pct}%` }}
              className="bg-amber-500 h-full"
              title={`Moderate: ${moderate.pct}%`}
            ></div>
            <div
              style={{ width: `${stable.pct}%` }}
              className="bg-emerald-500 h-full"
              title={`Stable: ${stable.pct}%`}
            ></div>
            <div
              style={{ width: `${declining.pct}%` }}
              className="bg-blue-500 h-full"
              title={`Declining: ${declining.pct}%`}
            ></div>
          </div>
        </div>

        {/* Legend & Stat Breakdown Rows */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="font-medium text-[#4B5563]">{highPressure.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold font-mono tabular-nums text-[#111827]">{highPressure.pct}%</span>
              <span className="w-16 text-right text-[#6B7280] text-xs font-normal">
                <span className="font-semibold font-mono text-[#111827]">{highPressure.count}</span> routes
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="font-medium text-[#4B5563]">{moderate.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold font-mono tabular-nums text-[#111827]">{moderate.pct}%</span>
              <span className="w-16 text-right text-[#6B7280] text-xs font-normal">
                <span className="font-semibold font-mono text-[#111827]">{moderate.count}</span> routes
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-[#4B5563]">{stable.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold font-mono tabular-nums text-[#111827]">{stable.pct}%</span>
              <span className="w-16 text-right text-[#6B7280] text-xs font-normal">
                <span className="font-semibold font-mono text-[#111827]">{stable.count}</span> routes
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="font-medium text-[#4B5563]">{declining.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold font-mono tabular-nums text-[#111827]">{declining.pct}%</span>
              <span className="w-16 text-right text-[#6B7280] text-xs font-normal">
                <span className="font-semibold font-mono text-[#111827]">{declining.count}</span> routes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#6B7280]">
        <span>Total routes monitored: <strong className="font-semibold font-mono text-[#111827]">{totalMonitored}</strong></span>
      </div>
    </div>
  );
};
