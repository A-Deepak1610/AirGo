import React from 'react';
import { DOMESTIC_FARE_MOVEMENT_DATA } from '../../config/dashboardData';

export const DomesticFareMovement = () => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header and Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Domestic Fare Movement
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Route-level comparison – August 2026
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-medium text-slate-600">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#1d4ed8]"></span>
              <span>Aug 2026</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#60a5fa]"></span>
              <span>Jul 2026</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#cbd5e1]"></span>
              <span>Aug 2025</span>
            </div>
          </div>
        </div>

        {/* Stacked Horizontal Comparison Bars */}
        <div className="mt-4 space-y-3">
          {DOMESTIC_FARE_MOVEMENT_DATA.map((item, idx) => {
            const max = 4000;
            const w1 = (item.aug26 / max) * 45;
            const w2 = (item.jul26 / max) * 35;
            const w3 = (item.aug25 / max) * 20;

            return (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <span className="w-16 text-[11px] font-bold text-slate-700 shrink-0">
                  {item.route}
                </span>

                <div className="flex-1 flex h-4.5 rounded-xs overflow-hidden bg-slate-100">
                  <div
                    style={{ width: `${w1}%` }}
                    className="bg-[#1d4ed8] h-full transition-all"
                    title={`Aug 2026: ₹${item.aug26}`}
                  ></div>
                  <div
                    style={{ width: `${w2}%` }}
                    className="bg-[#60a5fa] h-full transition-all"
                    title={`Jul 2026: ₹${item.jul26}`}
                  ></div>
                  <div
                    style={{ width: `${w3}%` }}
                    className="bg-[#cbd5e1] h-full transition-all"
                    title={`Aug 2025: ₹${item.aug25}`}
                  ></div>
                </div>

                <span className="w-14 text-right text-[11px] font-extrabold text-slate-800 shrink-0">
                  {item.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
