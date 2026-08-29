import React, { useState } from 'react';
import { useFilters } from '../../context/FilterContext';
import { 
  Filter, 
  ChevronDown, 
  RotateCcw, 
  Calendar, 
  PlaneTakeoff, 
  PlaneLanding, 
  Building2, 
  Tag, 
  Layers, 
  Check 
} from 'lucide-react';

export const FilterBar = () => {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const closeDropdown = () => setActiveDropdown(null);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-4 overflow-x-auto text-xs shadow-2xs relative z-10 select-none">
      {/* Filters Pill Row */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filters:</span>
        </div>

        {/* 1. Date Range Filter */}
        <div className="relative shrink-0">
          <button
            onClick={() => toggleDropdown('dateRange')}
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 transition-all text-xs whitespace-nowrap ${
              activeDropdown === 'dateRange'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Date Range:</span>
            <span className="font-semibold text-slate-800">{filters.dateRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
          </button>

          {activeDropdown === 'dateRange' && (
            <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-50 text-xs space-y-1">
              {['Aug 01 - Aug 31, 2026', 'Jul 01 - Jul 31, 2026', 'Jun 01 - Jun 30, 2026', 'Last 7 Days (Live)', 'Custom Range...'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    updateFilter('dateRange', opt);
                    closeDropdown();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer font-medium text-slate-700"
                >
                  <span>{opt}</span>
                  {filters.dateRange === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Origin Filter */}
        <div className="relative shrink-0">
          <button
            onClick={() => toggleDropdown('origin')}
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 transition-all text-xs whitespace-nowrap ${
              activeDropdown === 'origin'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            <PlaneTakeoff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Origin:</span>
            <span className="font-semibold text-slate-800">{filters.origin}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
          </button>

          {activeDropdown === 'origin' && (
            <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-50 text-xs space-y-1 max-h-56 overflow-y-auto">
              {['All Airports', 'DEL (Delhi)', 'BOM (Mumbai)', 'BLR (Bengaluru)', 'HYD (Hyderabad)', 'CCU (Kolkata)', 'MAA (Chennai)', 'AMD (Ahmedabad)', 'GOI (Goa)'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    updateFilter('origin', opt);
                    closeDropdown();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer font-medium text-slate-700"
                >
                  <span>{opt}</span>
                  {filters.origin === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Destination Filter */}
        <div className="relative shrink-0">
          <button
            onClick={() => toggleDropdown('destination')}
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 transition-all text-xs whitespace-nowrap ${
              activeDropdown === 'destination'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            <PlaneLanding className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Destination:</span>
            <span className="font-semibold text-slate-800">{filters.destination}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
          </button>

          {activeDropdown === 'destination' && (
            <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-50 text-xs space-y-1 max-h-56 overflow-y-auto">
              {['All Airports', 'DEL (Delhi)', 'BOM (Mumbai)', 'BLR (Bengaluru)', 'HYD (Hyderabad)', 'CCU (Kolkata)', 'MAA (Chennai)', 'AMD (Ahmedabad)', 'GOI (Goa)'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    updateFilter('destination', opt);
                    closeDropdown();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer font-medium text-slate-700"
                >
                  <span>{opt}</span>
                  {filters.destination === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Airline Filter */}
        <div className="relative shrink-0">
          <button
            onClick={() => toggleDropdown('airline')}
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 transition-all text-xs whitespace-nowrap ${
              activeDropdown === 'airline'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Airline:</span>
            <span className="font-semibold text-slate-800">{filters.airline}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
          </button>

          {activeDropdown === 'airline' && (
            <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-50 text-xs space-y-1">
              {['All Airlines', 'IndiGo (6E)', 'Air India (AI)', 'Akasa Air (QP)', 'SpiceJet (SG)', 'Air India Express (IX)'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    updateFilter('airline', opt);
                    closeDropdown();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer font-medium text-slate-700"
                >
                  <span>{opt}</span>
                  {filters.airline === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Route Category Filter */}
        <div className="relative shrink-0">
          <button
            onClick={() => toggleDropdown('routeCategory')}
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 transition-all text-xs whitespace-nowrap ${
              activeDropdown === 'routeCategory'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Route Category:</span>
            <span className="font-semibold text-slate-800">{filters.routeCategory}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
          </button>

          {activeDropdown === 'routeCategory' && (
            <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-50 text-xs space-y-1">
              {['All', 'Metro to Metro', 'Metro to Non-Metro', 'Tier-2 Feeder Corridors', 'Tourist & Regional'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    updateFilter('routeCategory', opt);
                    closeDropdown();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer font-medium text-slate-700"
                >
                  <span>{opt}</span>
                  {filters.routeCategory === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Fare Breakdown Filter */}
        <div className="relative shrink-0">
          <button
            onClick={() => toggleDropdown('fareBreakdown')}
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 transition-all text-xs whitespace-nowrap ${
              activeDropdown === 'fareBreakdown'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Fare Breakdown:</span>
            <span className="font-semibold text-slate-800">{filters.fareBreakdown}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
          </button>

          {activeDropdown === 'fareBreakdown' && (
            <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-50 text-xs space-y-1">
              {['All', 'Base Fare Only', 'Base Fare + Taxes', 'Checkout Total (Incl Fees)', 'Seat & Ancillary Adjusted'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    updateFilter('fareBreakdown', opt);
                    closeDropdown();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer font-medium text-slate-700"
                >
                  <span>{opt}</span>
                  {filters.fareBreakdown === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reset Action */}
      <button
        onClick={resetFilters}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer border border-transparent hover:border-slate-200"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
        <span>Reset Filters</span>
      </button>
    </div>
  );
};
