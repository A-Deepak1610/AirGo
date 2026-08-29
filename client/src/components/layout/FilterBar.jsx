import React from 'react';
import { useFilters } from '../../context/FilterContext';
import { Filter, ChevronDown, RotateCcw } from 'lucide-react';

export const FilterBar = () => {
  const { filters, updateFilter, resetFilters } = useFilters();

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto text-xs shadow-2xs">
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px] mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.2 cursor-pointer transition-colors text-slate-700">
          <span className="text-slate-500">Date Range:</span>
          <span className="font-semibold text-slate-800">{filters.dateRange}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </div>

        {/* Origin Airport Filter */}
        <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.2 cursor-pointer transition-colors text-slate-700">
          <span className="text-slate-500">Origin:</span>
          <span className="font-semibold text-slate-800">{filters.origin}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </div>

        {/* Destination Airport Filter */}
        <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.2 cursor-pointer transition-colors text-slate-700">
          <span className="text-slate-500">Destination:</span>
          <span className="font-semibold text-slate-800">{filters.destination}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </div>

        {/* Airline Filter */}
        <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.2 cursor-pointer transition-colors text-slate-700">
          <span className="text-slate-500">Airline:</span>
          <span className="font-semibold text-slate-800">{filters.airline}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </div>

        {/* Route Category Filter */}
        <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.2 cursor-pointer transition-colors text-slate-700">
          <span className="text-slate-500">Route Category:</span>
          <span className="font-semibold text-slate-800">{filters.routeCategory}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </div>

        {/* Fare Breakdown Filter */}
        <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.2 cursor-pointer transition-colors text-slate-700">
          <span className="text-slate-500">Fare Breakdown:</span>
          <span className="font-semibold text-slate-800">{filters.fareBreakdown}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={resetFilters}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset Filters</span>
      </button>
    </div>
  );
};
