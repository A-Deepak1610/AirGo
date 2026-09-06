import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Layers } from 'lucide-react';
import { LeadTimeCurveChart } from '../components/analytics/LeadTimeCurveChart';
import { PriceDistributionChart } from '../components/analytics/PriceDistributionChart';
import { TraceabilityModal } from '../components/analytics/TraceabilityModal';
import { PageHeader } from '../components/layout/PageHeader';
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
      {/* 1. Standard Reusable PageHeader with Breadcrumbs */}
      <PageHeader
        breadcrumbs={[
          { label: 'Index / APIx', path: '/index-apix' },
          { label: `Corridor ${routeData.route}` }
        ]}
        title={`${routeData.route} (${routeData.city1} ↔ ${routeData.city2})`}
        description={`DGCA Passenger Volume Rank: #${routeData.rank} · Annual Pax: ${routeData.totalPax.toLocaleString()} · Basket Weight: ${routeData.weightPct}%`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/index-apix')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Index
            </button>
            <button
              onClick={() => setIsTraceModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Database className="w-3.5 h-3.5" /> Trace Lineage
            </button>
          </div>
        }
      />

      {/* Corridor Key Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Corridor Index</span>
          <span className="text-2xl font-black text-blue-600 font-mono mt-0.5 block">{routeData.index}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Base 2024 = 100.0</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Fare (T+15)</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">₹{routeData.avgFare.toLocaleString()}</span>
          <span className="text-[11px] text-slate-500 font-medium">Mid-lead booking window</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">DGCA Volume Rank</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">#{routeData.rank}</span>
          <span className="text-[11px] text-slate-500 font-medium">{routeData.totalPax.toLocaleString()} pax</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Basket Weight</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">{routeData.weightPct}%</span>
          <span className="text-[11px] text-blue-600 font-medium">National Index Weight</span>
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
                      onClick={() => navigate('/airfare-data')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
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
