import React from 'react';
import { KPI_METRICS } from '../../config/dashboardData';
import { ArrowUpRight } from 'lucide-react';

export const MetricCards = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {KPI_METRICS.map((metric) => {
        const isAnomaly = metric.id === 'anomalies_detected';

        return (
          <div
            key={metric.id}
            className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all relative flex flex-col justify-between"
          >
            {/* Top row: Title and Alert tag if any */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-[#6B7280] leading-snug">
                {metric.title}
              </span>
              {metric.tag && (
                <span className="bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-medium px-1.5 py-0.5 rounded tracking-normal">
                  {metric.tag}
                </span>
              )}
            </div>

            {/* Middle: Big Value */}
            <div className="my-2.5">
              <span className="text-2xl sm:text-[26px] font-semibold tracking-tight text-[#111827] tabular-nums leading-none">
                {metric.value}
              </span>
            </div>

            {/* Bottom: Change and Subtext */}
            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-1 font-medium">
                {isAnomaly ? (
                  <span className="text-red-600 flex items-center gap-0.5 font-semibold">
                    {metric.change}
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-0.5 font-semibold">
                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    {metric.change}
                  </span>
                )}
                <span className="text-[#6B7280] font-normal text-[11px] truncate">{metric.changeSub}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
