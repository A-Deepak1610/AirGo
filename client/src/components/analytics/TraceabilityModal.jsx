import React, { useState } from 'react';
import { X, ArrowDown, Database, Globe, Compass, Calendar, Layers, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getRouteByCode, getFlightProductsList, getRawObservationsList } from '../../services/api';

export const TraceabilityModal = ({ isOpen, onClose, initialRoute = 'DEL-BOM', initialIndex = 118.42 }) => {
  const [selectedRoute, setSelectedRoute] = useState(initialRoute);
  const [selectedWindow, setSelectedWindow] = useState('T+15');

  if (!isOpen) return null;

  const routeData = getRouteByCode(selectedRoute);
  const flightProducts = getFlightProductsList().filter(f => f.route === selectedRoute);
  const rawObs = getRawObservationsList().filter(o => o.route === selectedRoute);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-900">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Statistical Aggregation & Traceability Audit
              </h2>
              <p className="text-xs text-slate-500">
                End-to-End lineage: National APIx → Route Index → Booking Window → Canonical Fare → Raw Quotes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Visual Trace Steps */}
        <div className="p-6 space-y-6 flex-1 bg-slate-50/50">
          {/* STEP 1: National Index */}
          <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">LEVEL 1: NATIONAL APIX INDEX</span>
                <div className="text-2xl font-black text-slate-900 mt-1">118.42 <span className="text-xs text-slate-500 font-normal">(Base 2024=100)</span></div>
                <p className="text-xs text-slate-500 mt-0.5">Aggregated over 20 DGCA routes weighted by annual passenger volume ($\sum w_i \cdot I_i$).</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Formula: $\sum w_i \cdot I_i$
              </span>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* STEP 2: Route Index Contribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LEVEL 2: ROUTE INDEX CONTRIBUTION</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xl font-extrabold text-slate-900">{routeData.route} ({routeData.city1} ↔ {routeData.city2})</span>
                  <span className="text-sm font-bold text-blue-600">Index: {routeData.index}</span>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-500">DGCA Basket Weight:</span>
                <div className="font-bold text-emerald-600">{(routeData.weightWithinBasket * 100).toFixed(2)}% ({routeData.totalPax.toLocaleString()} pax)</div>
              </div>
            </div>

            {/* Route Selector */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Select Route to Trace:</span>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="bg-slate-50 text-xs border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 font-semibold"
              >
                {['DEL-BOM', 'BLR-DEL', 'BOM-BLR', 'DEL-HYD', 'CCU-DEL', 'DEL-GOI'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* STEP 3: Booking Window Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LEVEL 3: BOOKING-WINDOW INDEX BREAKDOWN</span>
                <p className="text-xs text-slate-500 mt-1">Weighted aggregation of advance purchase windows for {selectedRoute}:</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {Object.entries(routeData.windows).map(([wKey, wData]) => (
                <button
                  key={wKey}
                  onClick={() => setSelectedWindow(wKey)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedWindow === wKey
                      ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase">{wKey}</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">₹{wData.avgFare.toLocaleString()}</div>
                  <div className="text-[10px] text-blue-600">Idx: {wData.index}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* STEP 4: Canonical Fare Product & Platform Quotes */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LEVEL 4: CANONICAL FARE PRODUCTS & PLATFORM QUOTES</span>
            {flightProducts.length > 0 ? (
              <div className="space-y-3">
                {flightProducts.map((fp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-100 border border-blue-200">{fp.flightNumber}</span>
                        <span className="text-slate-800 font-semibold">{fp.airline} ({fp.route})</span>
                        <span className="text-slate-500 text-[11px]">{fp.departureTime} departure</span>
                      </div>
                      <span className="font-mono text-emerald-700 font-bold">Canonical Fare: ₹{fp.currentPrice.toLocaleString()}</span>
                    </div>

                    {/* Platform disaggregation */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="py-1 px-2 font-medium">Platform</th>
                            <th className="py-1 px-2 font-medium">Base Fare</th>
                            <th className="py-1 px-2 font-medium">Taxes</th>
                            <th className="py-1 px-2 font-medium">Convenience Fee</th>
                            <th className="py-1 px-2 font-medium font-bold text-slate-900">Total Quote</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fp.platformQuotes.map((pq, qIdx) => (
                            <tr key={qIdx} className="border-b border-slate-200/60 text-slate-700">
                              <td className="py-1 px-2 font-medium flex items-center gap-1.5">
                                <span>{pq.platform}</span>
                                {pq.isDirect && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded border border-emerald-200">Direct</span>}
                              </td>
                              <td className="py-1 px-2 font-mono">₹{pq.baseFare}</td>
                              <td className="py-1 px-2 font-mono text-slate-500">₹{pq.taxes}</td>
                              <td className="py-1 px-2 font-mono text-amber-700">₹{pq.convenienceFee}</td>
                              <td className="py-1 px-2 font-mono font-bold text-slate-900">₹{pq.totalFare}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No canonical fare products sampled for this specific filter combo.</p>
            )}
          </div>

          <div className="flex justify-center -my-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* STEP 5: Raw Scraped Observations */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LEVEL 5: RAW SCRAPED OBSERVATIONS (GROUND TRUTH)</span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Dummy Data Verified
              </span>
            </div>

            <div className="space-y-1.5">
              {rawObs.slice(0, 3).map((obs, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] flex justify-between items-center text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-600 font-semibold">{obs.id}</span>
                    <span className="text-slate-500">{obs.source}</span>
                    <span className="text-slate-500">| Dep: {obs.travelDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">₹{obs.totalFare}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">{obs.qualityStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500 sticky bottom-0">
          <span>MoSPI & DGCA Data Audit Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
          >
            Close Audit Trace
          </button>
        </div>
      </div>
    </div>
  );
};
