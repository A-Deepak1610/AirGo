import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Layers } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { LeadTimeCurveChart } from '../components/analytics/LeadTimeCurveChart';
import { PriceDistributionChart } from '../components/analytics/PriceDistributionChart';
import { TraceabilityModal } from '../components/analytics/TraceabilityModal';
import { getRouteByCode, getFlightProductsList } from '../services/api';

export const RouteDetailPage = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);

  const routeCode = routeId ? routeId.toUpperCase() : 'DEL-BOM';
  const routeData = getRouteByCode(routeCode);
  const sampleFlights = getFlightProductsList().filter(f => f.route === routeCode);

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[
        { label: 'Route Index', path: '/index/routes' },
        { label: `Corridor ${routeData.route}`, path: `/index/routes/${routeData.route}` }
      ]} />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/index/routes')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Route List
          </button>

          <button
            onClick={() => setIsTraceModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Database className="w-3.5 h-3.5" /> Trace Lineage
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{routeData.route}</h1>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                {routeData.city1} ↔ {routeData.city2}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              DGCA Passenger Volume Rank: #{routeData.rank} | Annual Pax: {routeData.totalPax.toLocaleString()} | Basket Weight: {routeData.weightPct}%
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Corridor Index</span>
              <span className="text-2xl font-black text-blue-600 font-mono">{routeData.index}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Fare (T+15)</span>
              <span className="text-2xl font-black text-slate-900 font-mono">₹{routeData.avgFare.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Advance Booking Window Elasticity Curve */}
      <LeadTimeCurveChart routeCode={routeData.route} windowData={routeData.windows} />

      {/* Embedded Statistical Price Distribution */}
      <PriceDistributionChart routeCode={routeData.route} />

      {/* Sample Canonical Flight Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>Sample Canonical Flights Operating on {routeData.route}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Flight No & Airline</th>
                <th className="py-2.5 px-3 font-semibold">Departure Time</th>
                <th className="py-2.5 px-3 font-semibold">Advance Window</th>
                <th className="py-2.5 px-3 font-semibold">Base Fare</th>
                <th className="py-2.5 px-3 font-semibold">Taxes & Fees</th>
                <th className="py-2.5 px-3 font-semibold font-bold text-slate-900">Canonical Total</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sampleFlights.map((f) => (
                <tr key={f.flightNumber} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono text-[11px]">{f.flightNumber}</span>
                    <span>{f.airline}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{f.departureTime}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 font-bold">{f.advanceWindow}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">₹{f.baseFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">₹{f.taxes + f.fees}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-sm">₹{f.totalFare.toLocaleString()}</td>
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

      {/* Traceability Lineage Modal */}
      <TraceabilityModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        initialRoute={routeData.route}
        initialIndex={routeData.index}
      />
    </div>
  );
};
