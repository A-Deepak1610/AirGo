import React, { useState } from 'react';
import { HISTORICAL_TREND_DATA } from '../../config/dashboardData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export const HistoricalTrendChart = () => {
  const [activeMetric, setActiveMetric] = useState('index'); // 'index' | 'avgFare' | 'yoy'

  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'avgFare':
        return {
          dataKey: 'avgFare',
          domain: [5500, 7500],
          unit: '₹',
          formatValue: (val) => `₹${val.toLocaleString()}`
        };
      case 'yoy':
        return {
          dataKey: 'yoy',
          domain: [0, 15],
          unit: '%',
          formatValue: (val) => `+${val}%`
        };
      case 'index':
      default:
        return {
          dataKey: 'index',
          domain: [112, 132],
          unit: '',
          formatValue: (val) => val.toFixed(1)
        };
    }
  };

  const config = getMetricConfig();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700">
          <p className="font-semibold text-slate-300">{label} 2026</p>
          <p className="text-blue-400 font-bold mt-0.5">
            {activeMetric === 'avgFare' ? 'Average Fare: ' : activeMetric === 'yoy' ? 'YoY Change: ' : 'Index: '}
            {config.formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
      {/* Header & Metric Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            India Airfare Index – Historical Trend
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Base: January 2026 = 100 • Monthly average of domestic fare observations
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveMetric('index')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeMetric === 'index'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Index
          </button>
          <button
            onClick={() => setActiveMetric('avgFare')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeMetric === 'avgFare'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Average Fare
          </button>
          <button
            onClick={() => setActiveMetric('yoy')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeMetric === 'yoy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            YoY Change
          </button>
        </div>
      </div>

      {/* Mini Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4 py-2 px-1">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Current (Aug 2026)</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">128.6</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Previous Month</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">125.1</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">YoY Change</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-0.5 flex items-center gap-0.5">
            +10.7%
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">12-Month Trend</span>
          <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            Increasing
          </p>
        </div>
      </div>

      {/* Line / Area Chart */}
      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={HISTORICAL_TREND_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              dy={5}
            />
            <YAxis
              domain={config.domain}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(v) => `${config.unit}${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#indexGradient)"
              dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
