import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { getFlightProductsList } from '../services/api';

export const FlightAnalyticsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [airlineFilter, setAirlineFilter] = useState('ALL');
  const [windowFilter, setWindowFilter] = useState('ALL');

  const flights = getFlightProductsList();

  const filteredFlights = flights.filter(f => {
    const matchesSearch = f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.airline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.route.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoute = routeFilter === 'ALL' || f.route === routeFilter;
    const matchesAirline = airlineFilter === 'ALL' || f.airlineCode === airlineFilter;
    const matchesWindow = windowFilter === 'ALL' || f.advanceWindow === windowFilter;
    return matchesSearch && matchesRoute && matchesAirline && matchesWindow;
  });

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[{ label: 'Flight-Level Analytics', path: '/index/flights' }]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Canonical Flight Product Explorer
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Individual scheduled flight tariffs, base fare vs taxes disaggregation, and cross-platform quote comparisons.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search flight (e.g. 6E-201, AI-805, DEL-BOM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2"
          >
            <option value="ALL">All Corridors</option>
            <option value="DEL-BOM">DEL-BOM</option>
            <option value="BLR-DEL">BLR-DEL</option>
            <option value="BOM-BLR">BOM-BLR</option>
            <option value="DEL-HYD">DEL-HYD</option>
          </select>

          <select
            value={airlineFilter}
            onChange={(e) => setAirlineFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2"
          >
            <option value="ALL">All Airlines</option>
            <option value="6E">IndiGo (6E)</option>
            <option value="AI">Air India (AI)</option>
            <option value="QP">Akasa Air (QP)</option>
            <option value="SG">SpiceJet (SG)</option>
          </select>

          <select
            value={windowFilter}
            onChange={(e) => setWindowFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2"
          >
            <option value="ALL">All Windows</option>
            <option value="T+1">T+1</option>
            <option value="T+7">T+7</option>
            <option value="T+15">T+15</option>
            <option value="T+30">T+30</option>
          </select>
        </div>
      </div>

      {/* Flight Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Flight No & Airline</th>
                <th className="py-2.5 px-3 font-semibold">Route Corridor</th>
                <th className="py-2.5 px-3 font-semibold">Dep / Arrival</th>
                <th className="py-2.5 px-3 font-semibold">Travel Date</th>
                <th className="py-2.5 px-3 font-semibold">Advance Window</th>
                <th className="py-2.5 px-3 font-semibold">Base Fare</th>
                <th className="py-2.5 px-3 font-semibold">Taxes & Fees</th>
                <th className="py-2.5 px-3 font-semibold font-bold text-slate-900">Canonical Total</th>
                <th className="py-2.5 px-3 font-semibold">Flight Index</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlights.map((f) => (
                <tr key={f.flightNumber} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono text-[11px]">{f.flightNumber}</span>
                    <span>{f.airline}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{f.route}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{f.departureTime} → {f.arrivalTime}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{f.travelDate}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 font-bold">{f.advanceWindow}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">₹{f.baseFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">₹{f.taxes + f.fees}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-sm">₹{f.totalFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 font-bold">{f.index}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => navigate(`/index/flights/${f.flightNumber}`)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                    >
                      Compare OTAs →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
