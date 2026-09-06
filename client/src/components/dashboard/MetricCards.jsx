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
              <span className="text-[11px] font-medium text-slate-500 leading-snug">
                {metric.title}
              </span>
              {metric.tag && (
                <span className="bg-red-500/10 text-red-600 border border-red-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider">
                  {metric.tag}
                </span>
              )}
            </div>

            {/* Middle: Big Value */}
            <div className="my-2.5">
              <span className={`text-2xl font-extrabold tracking-tight ${isAnomaly ? 'text-slate-900' : 'text-slate-900'}`}>
                {metric.value}
              </span>
            </div>

            {/* Bottom: Change and Subtext */}
            <div className="text-[10px] space-y-0.5">
              <div className="flex items-center gap-1 font-semibold">
                {isAnomaly ? (
                  <span className="text-red-600 flex items-center gap-0.5">
                    {metric.change}
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    {metric.change}
                  </span>
                )}
                <span className="text-slate-400 font-normal truncate">{metric.changeSub}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
