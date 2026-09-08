import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Sliders, 
  ArrowRight, 
  RotateCcw, 
  FileCheck, 
  History,
  Info,
  Check,
  X
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionGuard } from '../components/common/ActionGuard';
import { DATA_QUALITY_METRICS, VALIDATION_RULES, ANOMALY_QUEUE, REMEDIATION_AUDIT_TRAIL } from '../data/dataQualityData';

export const DataQualityPage = () => {
  const [anomalies, setAnomalies] = useState(ANOMALY_QUEUE);
  const [remediations, setRemediations] = useState(REMEDIATION_AUDIT_TRAIL);
  const [activeTab, setActiveTab] = useState('queue'); // queue, rules, audit
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [customCleanValue, setCustomCleanValue] = useState('');
  const [remediationReason, setRemediationReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  const filteredAnomalies = anomalies.filter(a => {
    const matchesSearch = a.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.anomalyType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveClean = (anomaly) => {
    const finalVal = customCleanValue ? parseInt(customCleanValue, 10) : anomaly.suggestedCleanValue;
    const finalReason = remediationReason || anomaly.cleanReason;

    // Update anomaly
    setAnomalies(prev => prev.map(item => {
      if (item.id === anomaly.id) {
        return {
          ...item,
          status: 'REMEDIATED',
          remediatedValue: finalVal
        };
      }
      return item;
    }));

    // Add to audit trail
    const newRemediation = {
      id: `REM-${Date.now().toString().slice(-4)}`,
      anomalyId: anomaly.id,
      date: new Date().toLocaleString('en-IN') + ' IST',
      reviewer: 'Active Reviewer (Authenticated Session)',
      role: 'Policy Reviewer / Admin',
      route: anomaly.route,
      originalValue: `₹${anomaly.observedPrice.toLocaleString('en-IN')}`,
      cleanedValue: finalVal ? `₹${finalVal.toLocaleString('en-IN')}` : 'Discarded',
      reason: finalReason,
      status: 'APPROVED_FOR_APIX'
    };
    setRemediations(prev => [newRemediation, ...prev]);

    setNotification(`Successfully remediated ${anomaly.id} (${anomaly.route})`);
    setTimeout(() => setNotification(''), 3000);
    setSelectedAnomaly(null);
    setCustomCleanValue('');
    setRemediationReason('');
  };

  const handleRejectAnomaly = (anomaly) => {
    setAnomalies(prev => prev.map(item => {
      if (item.id === anomaly.id) {
        return { ...item, status: 'REJECTED' };
      }
      return item;
    }));

    setNotification(`Marked observation ${anomaly.id} as valid raw data (no remediation applied).`);
    setTimeout(() => setNotification(''), 3000);
    setSelectedAnomaly(null);
  };

  return (
    <div className="space-y-6 text-[#111827] font-sans animate-in fade-in duration-200">
      {/* 1. Standard Reusable PageHeader */}
      <PageHeader
        title="Data Quality & Anomaly Remediation Center"
        description="Dedicated quality-assurance and remediation engine ensuring raw airfare observations conform strictly to zero-dummy, outlier winsorization, and econometric validation policies."
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Quality Index: {DATA_QUALITY_METRICS.overallScore}% · Grade A+
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'queue' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Anomaly Queue ({anomalies.filter(a => a.status === 'PENDING_REVIEW').length})
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'rules' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Validation Rules ({VALIDATION_RULES.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'audit' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Remediation Log ({remediations.length})
            </button>
          </div>
        }
        filters={
          activeTab === 'queue' && (
            <div className="flex items-center justify-between gap-3 flex-wrap w-full text-[13px]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="Search route, flight number, anomaly..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[13px] focus:outline-none focus:border-blue-500 w-64 text-[#111827]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[13px] text-[#111827] focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Triage Statuses</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="UNDER_INVESTIGATION">Under Investigation</option>
                  <option value="REMEDIATED">Remediated & Certified</option>
                  <option value="REJECTED">Rejected (Kept Raw)</option>
                </select>
              </div>

              <span className="text-xs text-[#6B7280]">
                Showing <strong>{filteredAnomalies.length}</strong> anomaly items
              </span>
            </div>
          )
        }
      />

      {/* Alert Notice */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Quality Breakdown KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium">Audited Ingestion Volume</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">442,100</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">438,563 clean observations</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium">Flagged for Triage</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{anomalies.filter(a => a.status === 'PENDING_REVIEW').length} Pending</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting reviewer sign-off</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium">Remediated This Month</span>
          <p className="text-2xl font-bold text-blue-700 mt-1">{remediations.length} Records</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Winsorized or imputed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium">Zero-Dummy Integrity</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">100.0%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Zero synthetic numbers allowed</p>
        </div>
      </div>

      {/* Tab 1: Anomaly Review Queue */}
      {activeTab === 'queue' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[#4B5563] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Anomaly ID</th>
                  <th className="py-3 px-3">Corridor & Flight</th>
                  <th className="py-3 px-3">Lead Time</th>
                  <th className="py-3 px-3">Observed Fare</th>
                  <th className="py-3 px-3">Expected Range</th>
                  <th className="py-3 px-3">Anomaly Classification</th>
                  <th className="py-3 px-3">Detected At</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#111827]">
                {filteredAnomalies.map((anom) => {
                  const isPending = anom.status === 'PENDING_REVIEW';
                  const isRemediated = anom.status === 'REMEDIATED';

                  return (
                    <tr key={anom.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {anom.id}
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{anom.route}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{anom.carrier} {anom.flightNumber}</p>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-700 font-semibold">
                        {anom.window}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-rose-700">
                        ₹{anom.observedPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-500">
                        {anom.expectedPriceRange}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{anom.anomalyType}</span>
                        <p className="text-[10px] text-slate-400">Confidence {anom.confidenceScore}%</p>
                      </td>

                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {anom.detectedAt}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : isRemediated
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {anom.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <ActionGuard permission="canRemediateDataQuality" requiredRoleLabel="Policy Reviewer or Admin">
                          <button
                            onClick={() => {
                              setSelectedAnomaly(anom);
                              setCustomCleanValue(anom.suggestedCleanValue?.toString() || '');
                              setRemediationReason(anom.cleanReason || '');
                            }}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Review & Fix</span>
                          </button>
                        </ActionGuard>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Validation Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Validation & Cleansing Rules</h3>
            <span className="text-xs text-slate-500">Autonomous outlier and anomaly guards</span>
          </div>
          <div className="divide-y divide-slate-100">
            {VALIDATION_RULES.map((rule) => (
              <div key={rule.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400">{rule.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{rule.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                      rule.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : rule.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-slate-600">{rule.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block text-[11px]">
                    {rule.threshold}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{rule.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Remediation Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Official Remediation Audit History</h3>
            <span className="text-xs text-slate-500">Traceability of all price adjustments</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Reviewer / Role</th>
                  <th className="p-3">Corridor</th>
                  <th className="p-3">Before → After</th>
                  <th className="p-3">Justification</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {remediations.map((rem) => (
                  <tr key={rem.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{rem.id}</td>
                    <td className="p-3 text-slate-500">{rem.date}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{rem.reviewer}</p>
                      <p className="text-[10px] text-slate-400">{rem.role}</p>
                    </td>
                    <td className="p-3 font-bold">{rem.route}</td>
                    <td className="p-3 font-mono">
                      <span className="line-through text-rose-500">{rem.originalValue}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="font-bold text-emerald-700">{rem.cleanedValue}</span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs">{rem.reason}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {rem.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Remediation Action Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Remediate Observation {selectedAnomaly.id}</h3>
                <p className="text-xs text-slate-500">{selectedAnomaly.route} · {selectedAnomaly.carrier} {selectedAnomaly.flightNumber} ({selectedAnomaly.window})</p>
              </div>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{selectedAnomaly.anomalyType}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{selectedAnomaly.rawContext}</p>
              </div>

              {/* Side-by-side Before / After */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Observed Raw Fare</span>
                  <p className="text-lg font-bold text-rose-600 mt-0.5">
                    ₹{selectedAnomaly.observedPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Expected: {selectedAnomaly.expectedPriceRange}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Proposed Cleaned Fare</span>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">
                    {customCleanValue ? `₹${parseInt(customCleanValue, 10).toLocaleString('en-IN')}` : selectedAnomaly.suggestedCleanValue ? `₹${selectedAnomaly.suggestedCleanValue.toLocaleString('en-IN')}` : 'Discard Observation'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Winsorized / Imputed</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Override Cleaned Value (₹ INR)</label>
                <input
                  type="number"
                  placeholder={selectedAnomaly.suggestedCleanValue ? selectedAnomaly.suggestedCleanValue.toString() : 'Leave blank to discard'}
                  value={customCleanValue}
                  onChange={(e) => setCustomCleanValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Remediation (Audit Log Mandatory)</label>
                <textarea
                  rows={2}
                  value={remediationReason}
                  placeholder={selectedAnomaly.cleanReason}
                  onChange={(e) => setRemediationReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleRejectAnomaly(selectedAnomaly)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 font-medium text-xs"
                >
                  Reject & Keep Raw
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAnomaly(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveClean(selectedAnomaly)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs"
                  >
                    Approve Cleaned Value
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
