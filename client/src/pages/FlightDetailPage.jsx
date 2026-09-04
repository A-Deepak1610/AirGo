import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database } from 'lucide-react';
import { StatisticalBreadcrumbs } from '../components/analytics/StatisticalBreadcrumbs';
import { PlatformComparisonTable } from '../components/analytics/PlatformComparisonTable';
import { TraceabilityModal } from '../components/analytics/TraceabilityModal';
import { getFlightByNumber } from '../services/api';

export const FlightDetailPage = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [isTraceModalOpen, setIsTraceModalOpen] = React.useState(false);

  const flightNo = flightId ? flightId.toUpperCase() : '6E-201';
  const fData = getFlightByNumber(flightNo);

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Breadcrumb Navigation */}
      <StatisticalBreadcrumbs items={[
        { label: 'Flight Analytics', path: '/index/flights' },
        { label: `Flight ${fData.flightNumber}`, path: `/index/flights/${fData.flightNumber}` }
      ]} />

      {/* Header Banner - Distilled & Authoritative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/index/flights')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Flights List
          </button>

          <button
            onClick={() => setIsTraceModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Database className="w-3.5 h-3.5" /> Trace Scraped Quotes
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{fData.flightNumber}</h1>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                {fData.airline} ({fData.route})
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Departure: {fData.departureTime} → Arrival: {fData.arrivalTime} | Travel Date: {fData.travelDate} | Horizon: {fData.advanceWindow}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Base Tariff</span>
              <span className="text-lg font-black text-slate-900 font-mono">₹{fData.baseFare.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Taxes & Fees</span>
              <span className="text-lg font-black text-slate-700 font-mono">₹{(fData.taxes + fData.fees).toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Canonical Total</span>
              <span className="text-xl font-black text-blue-600 font-mono">₹{fData.totalFare.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embed Cross-Platform Comparison Table */}
      <PlatformComparisonTable flight={fData} />

      {/* Traceability Modal */}
      <TraceabilityModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        initialRoute={fData.route}
        initialIndex={fData.index}
      />
    </div>
  );
};
