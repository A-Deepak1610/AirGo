import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

export const PriceDistributionChart = ({ routeCode = 'DEL-BOM', fares = [3400, 3800, 4200, 4500, 4700, 4900, 5100, 5200, 5400, 5600, 5800, 6100, 6400, 6800, 7200, 7800, 8500, 9200, 11500] }) => {
  const [metric, setMetric] = useState('total'); // 'total' | 'base' | 'relative'

  // Calculate Statistical Distribution Metrics
  const sorted = [...fares].sort((a, b) => a - b);
  const count = sorted.length;
  const min = sorted[0];
  const max = sorted[count - 1];
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = Math.round(sum / count);
  const median = sorted[Math.floor(count / 2)];
  const p25 = sorted[Math.floor(count * 0.25)];
  const p75 = sorted[Math.floor(count * 0.75)];
  const p90 = sorted[Math.floor(count * 0.90)];
  const iqr = p75 - p25;
  const upperOutlierFence = p75 + 1.5 * iqr;

  // Histogram Bucket Generation
  const bucketCount = 8;
  const step = Math.ceil((max - min) / bucketCount);
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const start = min + i * step;
    const end = start + step;
    const items = sorted.filter(v => v >= start && (i === bucketCount - 1 ? v <= end : v < end));
    return { range: `₹${(start/1000).toFixed(1)}k - ₹${(end/1000).toFixed(1)}k`, count: items.length, start, end };
  });

  const maxBucketCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Airfare Statistical Price Distribution Histogram ({routeCode})</span>
          </h3>
          <p className="text-[13px] text-[#4B5563] mt-0.5">
            Empirical probability density of clean scraped fares highlighting central tendency and IQR outlier fences.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[13px] font-medium">
          <button
            onClick={() => setMetric('total')}
            className={`px-3 py-1 rounded-md transition-all ${
              metric === 'total' ? 'bg-white text-[#111827] shadow-2xs font-medium' : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Total Fare
          </button>
          <button
            onClick={() => setMetric('base')}
            className={`px-3 py-1 rounded-md transition-all ${
              metric === 'base' ? 'bg-white text-[#111827] shadow-2xs font-medium' : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Base Fare
          </button>
        </div>
      </div>

      {/* Distribution Histogram Bars */}
      <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
        {buckets.map((b, idx) => {
          const heightPct = (b.count / maxBucketCount) * 100;
          const isOutlierBucket = b.start >= upperOutlierFence;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono shadow-md">
                {b.range}: {b.count} quotes
              </div>

              {/* Bar */}
              <div
                style={{ height: `${Math.max(heightPct, 6)}%` }}
                className={`w-full rounded-t-md transition-all ${
                  isOutlierBucket
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              />
              <span className="text-[10px] text-[#6B7280] font-mono mt-1 rotate-0 truncate max-w-full">
                {(b.start / 1000).toFixed(1)}k
              </span>
            </div>
          );
        })}
      </div>

      {/* Statistical Quantiles Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-center">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-[#6B7280] block">Mean (Avg)</span>
          <span className="text-sm font-semibold text-[#111827] font-mono tabular-nums">₹{mean.toLocaleString()}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-[#6B7280] block">Median (P50)</span>
          <span className="text-sm font-semibold text-blue-600 font-mono tabular-nums">₹{median.toLocaleString()}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-[#6B7280] block">25th Percentile</span>
          <span className="text-sm font-semibold text-[#111827] font-mono tabular-nums">₹{p25.toLocaleString()}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-[#6B7280] block">75th Percentile</span>
          <span className="text-sm font-semibold text-[#111827] font-mono tabular-nums">₹{p75.toLocaleString()}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-[#6B7280] block">90th Percentile</span>
          <span className="text-sm font-semibold text-amber-700 font-mono tabular-nums">₹{p90.toLocaleString()}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-[#6B7280] block">IQR Outlier Fence</span>
          <span className="text-sm font-semibold text-red-600 font-mono tabular-nums">&gt; ₹{Math.round(upperOutlierFence).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
