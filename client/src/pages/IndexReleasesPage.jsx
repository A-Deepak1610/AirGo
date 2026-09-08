import React, { useState } from 'react';
import { 
  Tag, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Layers, 
  TrendingUp, 
  Plus, 
  ExternalLink,
  GitCompare,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionGuard } from '../components/common/ActionGuard';
import { INDEX_RELEASES, RELEASE_COMPARISON_METRICS } from '../data/indexReleasesData';

export const IndexReleasesPage = () => {
  const [releases, setReleases] = useState(INDEX_RELEASES);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [primaryCompareId, setPrimaryCompareId] = useState('REL-2026-M08');
  const [secondaryCompareId, setSecondaryCompareId] = useState('REL-2026-M07');
  const [actionNotice, setActionNotice] = useState('');

  const handlePublish = (releaseId) => {
    setReleases(prev => prev.map(r => {
      if (r.id === releaseId) {
        return {
          ...r,
          status: 'PUBLISHED',
          publicationTimestamp: new Date().toLocaleString('en-IN') + ' IST',
          approvedBy: 'Authenticated Reviewer'
        };
      }
      return r;
    }));
    setActionNotice(`Successfully certified and published ${releaseId} to live API feeds.`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  return (
    <div className="space-y-6 text-[#111827] font-sans animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <PageHeader
        title="Official Index Releases & Publication Governance"
        description="Formal multi-stage publication pipeline certifying monthly, quarterly, and benchmark revisions of the Real-time Airfare Price Index (APIx) for MoSPI and RBI integration."
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <Tag className="w-3.5 h-3.5" />
            Active Headline Release: REL-2026-M08 (118.4)
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsComparing(!isComparing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer ${
                isComparing ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{isComparing ? 'Hide Comparison' : 'Compare Releases'}</span>
            </button>

            <ActionGuard permission="canApproveReleases" requiredRoleLabel="Policy Reviewer or Admin">
              <button
                onClick={() => {
                  alert('Initiating drafting workflow for September 2026 Preliminary Index. Coverage checks will run across 25 corridors.');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Draft Release</span>
              </button>
            </ActionGuard>
          </div>
        }
      />

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionNotice}
        </div>
      )}

      {/* Interactive Release Comparison View (Toggleable) */}
      {isComparing && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-blue-600" />
                <span>Inter-Release Econometric Diff Comparison</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyze headline divergence, passenger weight shifts, and sector-level price movements between benchmark periods.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={primaryCompareId}
                onChange={(e) => setPrimaryCompareId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800"
              >
                {releases.map(r => (
                  <option key={r.id} value={r.id}>{r.id} ({r.period.split(' ')[0]})</option>
                ))}
              </select>
              <span className="text-slate-400 font-bold">vs</span>
              <select
                value={secondaryCompareId}
                onChange={(e) => setSecondaryCompareId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800"
              >
                {releases.map(r => (
                  <option key={r.id} value={r.id}>{r.id} ({r.period.split(' ')[0]})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Headline APIx Delta</span>
              <p className="text-lg font-bold text-blue-700 mt-0.5">{RELEASE_COMPARISON_METRICS.headlineDelta}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Driven by trunk sector festive advance bookings</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Observations Sampling Delta</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{RELEASE_COMPARISON_METRICS.observationsDelta}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Expanded Akasa Air and Air India Express scraping coverage</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Corridor</th>
                  <th className="p-2.5">Traffic Weight</th>
                  <th className="p-2.5">{primaryCompareId} Index</th>
                  <th className="p-2.5">{secondaryCompareId} Index</th>
                  <th className="p-2.5">Relative Movement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RELEASE_COMPARISON_METRICS.sectorsComparison.map((sec) => (
                  <tr key={sec.corridor} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold">{sec.corridor}</td>
                    <td className="p-2.5 font-mono text-slate-600">{sec.weight}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">{sec.primaryIndex}</td>
                    <td className="p-2.5 font-mono text-slate-600">{sec.secondaryIndex}</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-700">
                      {sec.delta} pts ({sec.trend})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Releases Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[#4B5563] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Release ID & Period</th>
                <th className="py-3 px-3">Headline APIx</th>
                <th className="py-3 px-3">MoM Change</th>
                <th className="py-3 px-3">Specification</th>
                <th className="py-3 px-3">Observations Coverage</th>
                <th className="py-3 px-3">Reviewer & Approval</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#111827]">
              {releases.map((rel) => {
                const isPublished = rel.status === 'PUBLISHED';
                const isUnderReview = rel.status === 'UNDER_REVIEW';

                return (
                  <tr key={rel.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Release ID & Period */}
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-slate-900">{rel.id}</p>
                      <p className="text-[11px] text-[#6B7280]">{rel.period}</p>
                    </td>

                    {/* Headline APIx */}
                    <td className="py-3 px-3">
                      <span className="text-base font-bold font-mono text-blue-700">{rel.headlineApix}</span>
                      <span className="text-[10px] text-slate-400 block">Base 2024=100</span>
                    </td>

                    {/* MoM Change */}
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {rel.momChange}
                    </td>

                    {/* Specification */}
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      <p>{rel.methodologyVersion}</p>
                      <p className="text-[10px] text-slate-400">Basket {rel.basketVersion}</p>
                    </td>

                    {/* Observations Coverage */}
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{rel.observationsCount.toLocaleString('en-IN')} obs</p>
                      <p className="text-[10px] text-emerald-700 font-bold">{rel.dataCoveragePct}% coverage</p>
                    </td>

                    {/* Reviewer & Approval */}
                    <td className="py-3 px-3">
                      <p className="text-slate-800 font-medium text-[11px]">{rel.reviewedBy}</p>
                      <p className="text-[10px] text-slate-400">{rel.approvalTimestamp}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isUnderReview
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {rel.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedRelease(rel)}
                        className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>

                      {isUnderReview && (
                        <ActionGuard permission="canApproveReleases" requiredRoleLabel="Policy Reviewer or Admin">
                          <button
                            onClick={() => handlePublish(rel.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            Certify & Publish
                          </button>
                        </ActionGuard>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Release Inspection Modal */}
      {selectedRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedRelease.title}</h3>
                <p className="text-xs text-slate-500">Official Certification Manifest · {selectedRelease.id}</p>
              </div>
              <button
                onClick={() => setSelectedRelease(null)}
                className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Headline APIx</span>
                  <p className="text-xl font-bold text-blue-700 mt-0.5">{selectedRelease.headlineApix}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">MoM Inflation</span>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">{selectedRelease.momChange}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Observations</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{selectedRelease.observationsCount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Methodological Change Summary:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  {selectedRelease.changeSummary}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Key Corridor Price Indices:</span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(selectedRelease.sectorIndices || {}).map(([sec, val]) => (
                    <div key={sec} className="p-2 border border-slate-200 rounded bg-white flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-700">{sec}</span>
                      <span className="font-mono font-bold text-blue-700">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Published to NSO & RBI live feeds</span>
                <button
                  onClick={() => setSelectedRelease(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
