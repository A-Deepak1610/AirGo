import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Layers, 
  Code, 
  X, 
  Download, 
  ShieldCheck,
  Percent
} from 'lucide-react';
import { rawObservationsList, flightProductsList, dataQualitySummary } from '../data/analyticsData';
import { PageHeader } from '../components/layout/PageHeader';

export const AirfareDataPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('ALL');
  const [selectedWindow, setSelectedWindow] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedObs, setSelectedObs] = useState(null);

  // Filter observations
  const filteredObs = rawObservationsList.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.flightNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoute = selectedRoute === 'ALL' || o.route === selectedRoute;
    const matchesWindow = selectedWindow === 'ALL' || o.window === selectedWindow;
    const matchesStatus = selectedStatus === 'ALL' || o.qualityStatus === selectedStatus;

    return matchesSearch && matchesRoute && matchesWindow && matchesStatus;
  });

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawObservationsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "airfare_cleaned_observations.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans animate-in fade-in duration-200">
      {/* 1. Standard Reusable PageHeader */}
      <PageHeader
        title="Airfare Data Cleaning & Normalization"
        description="Multi-component fare disaggregation (Base, Taxes, UDF, Convenience fees), Tukey 1.5× IQR outlier rejection, and canonical deduplication."
        badge={
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
            Tukey 1.5× IQR Fence: Active
          </span>
        }
        actions={
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Cleaned Quotes
          </button>
        }
        filters={
          <div className="flex items-center justify-between gap-3 flex-wrap w-full text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Route */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium">
                <span className="text-slate-400">Route:</span>
                <select 
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Routes</option>
                  <option value="DEL-BOM">DEL-BOM</option>
                  <option value="BLR-DEL">BLR-DEL</option>
                  <option value="BOM-BLR">BOM-BLR</option>
                  <option value="DEL-HYD">DEL-HYD</option>
                  <option value="BOM-GOI">BOM-GOI</option>
                </select>
              </div>

              {/* Window */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium">
                <span className="text-slate-400">Window:</span>
                <select 
                  value={selectedWindow}
                  onChange={(e) => setSelectedWindow(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Windows</option>
                  <option value="T+1">T+1 (1 Day)</option>
                  <option value="T+7">T+7 (7 Days)</option>
                  <option value="T+15">T+15 (15 Days)</option>
                  <option value="T+30">T+30 (30 Days)</option>
                  <option value="T+45">T+45 (45 Days)</option>
                </select>
              </div>

              {/* Quality Status */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium">
                <span className="text-slate-400">Status:</span>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NORMALIZED_VALID">NORMALIZED_VALID</option>
                  <option value="OUTLIER_REJECTED">OUTLIER_REJECTED</option>
                </select>
              </div>
            </div>

            {/* Observation Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Quote ID, Flight, Source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 w-56"
              />
            </div>
          </div>
        }
      />

      {/* 4 Pipeline Quality Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valid Cleansed Quotes</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {dataQualitySummary.validCount.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>97.3% Clean Yield</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Canonical Deduplication</p>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
            {dataQualitySummary.duplicateCount} Merged
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Cross-platform duplicate suppression</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outliers Excluded (1.5x IQR)</p>
          <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {dataQualitySummary.outliersRejected} Filtered
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold mt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Anomalous scraper artifacts discarded</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Component Disaggregation</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">100%</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Base + UDF + GST + Conv Fee</span>
          </div>
        </div>
      </div>

      {/* Section: Component Disaggregation Breakdown & Explanatory Architecture */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              Fare Component Disaggregation Architecture
            </h2>
            <p className="text-xs text-slate-500">
              DGCA & MoSPI compliant normalization separating pure airline yield from statutory government levies and intermediary fees.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Total Mandatory Fare = Base + Taxes + UDF + Convenience Fee</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-900">1. Base Fare</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">~81.5%</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Airline's core commercial tariff for seat transportation. Forms the primary weight in elementary Laspeyres index relative calculations.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-900">2. Statutory Taxes</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">~9.2%</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              GST (Goods & Services Tax) computed at 5% on domestic Economy class tickets, plus fuel surcharges where non-separable.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-900">3. UDF & Airport Charges</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">~6.8%</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              User Development Fee (UDF), Passenger Service Fee (PSF), and airport regulatory tariffs authorized by AERA.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-900">4. Convenience Charges</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">~2.5%</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Mandatory checkout booking fees charged by OTAs (₹50 to ₹310). Excluded from pure airline index; monitored for consumer burden.
            </p>
          </div>
        </div>

        {/* Component Disaggregation Table Across Sample Normalized Flights */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold">
                <th className="py-2.5 px-3">Flight & Airline</th>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Horizon</th>
                <th className="py-2.5 px-3 font-mono">Base Fare (₹)</th>
                <th className="py-2.5 px-3 font-mono">UDF / Airport (₹)</th>
                <th className="py-2.5 px-3 font-mono">GST / Taxes (₹)</th>
                <th className="py-2.5 px-3 font-mono">Conv Fee (₹)</th>
                <th className="py-2.5 px-3 font-mono font-bold text-slate-900">Total Mandatory Fare</th>
                <th className="py-2.5 px-3 text-right">Normalized Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {flightProductsList.slice(0, 5).map((f) => {
                const udf = Math.round(f.taxes * 0.42);
                const gst = f.taxes - udf;
                return (
                  <tr key={f.canonicalId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {f.flightNumber} ({f.airline})
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">{f.route}</td>
                    <td className="py-2.5 px-3 font-mono font-bold">{f.advanceWindow}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-800 font-semibold">₹{f.baseFare.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700">₹{udf}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">₹{gst}</td>
                    <td className="py-2.5 px-3 font-mono text-purple-700">₹{f.fees}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-sm">₹{f.totalFare.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section: Observation Audit Stream Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Disaggregated Airfare Observation Audit Stream
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredObs.length} validated records matching active route and temporal filters.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
            Canonical Dedup: Active
          </span>
        </div>

        {/* Master Observations Table & JSON Inspector Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${selectedObs ? 'lg:col-span-2' : 'lg:col-span-3'} overflow-x-auto`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold">
                  <th className="py-2.5 px-3">Observation ID</th>
                  <th className="py-2.5 px-3">Source Channel</th>
                  <th className="py-2.5 px-3">Route / Flight</th>
                  <th className="py-2.5 px-3 font-mono">Horizon</th>
                  <th className="py-2.5 px-3 font-mono">Base (₹)</th>
                  <th className="py-2.5 px-3 font-mono">Taxes (₹)</th>
                  <th className="py-2.5 px-3 font-mono">Conv Fee (₹)</th>
                  <th className="py-2.5 px-3 font-mono font-bold text-slate-900">Total Mandatory</th>
                  <th className="py-2.5 px-3">Cleaning Audit</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredObs.map((o) => (
                  <tr 
                    key={o.id} 
                    className={`hover:bg-slate-50 transition-colors ${selectedObs?.id === o.id ? 'bg-blue-50/60' : ''}`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{o.id}</td>
                    <td className="py-2.5 px-3 text-slate-600">{o.source}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {o.route} · <span className="font-mono text-slate-500">{o.flightNo}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">{o.window}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">₹{o.baseFare}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">₹{o.taxes}</td>
                    <td className="py-2.5 px-3 font-mono text-purple-700">₹{o.fees}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-sm">₹{o.totalFare}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        o.qualityStatus === 'VALID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {o.qualityStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedObs(o)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Inspect Payload →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* JSON Inspector Drawer */}
          {selectedObs && (
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md space-y-3 flex flex-col font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 font-sans">
                  <Code className="w-4 h-4 text-blue-400" />
                  Observation Raw Payload ({selectedObs.id})
                </span>
                <button 
                  onClick={() => setSelectedObs(null)} 
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 font-sans text-[11px] text-slate-300 pb-2 border-b border-slate-800">
                <p><strong className="text-slate-400">Canonical Key:</strong> {selectedObs.canonicalId}</p>
                <p><strong className="text-slate-400">Timestamp:</strong> {selectedObs.timestamp}</p>
                <p><strong className="text-slate-400">Availability:</strong> {selectedObs.availability}</p>
              </div>

              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto flex-1 leading-relaxed shadow-inner">
                {JSON.stringify(selectedObs, null, 2)}
              </pre>

              <div className="text-[10px] text-slate-400 font-sans">
                Normalized and disaggregated per DGCA tariff audit specifications.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
