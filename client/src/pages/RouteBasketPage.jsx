import React, { useState } from 'react';
import { 
  Plane, 
  Search, 
  Filter, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  History, 
  ShieldCheck, 
  Tag, 
  Plus, 
  Layers,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionGuard } from '../components/common/ActionGuard';
import { BASKET_VERSIONS, REPRESENTATIVE_ROUTES, BASKET_CHANGE_LOG } from '../data/routeBasketData';

export const RouteBasketPage = () => {
  const [routes, setRoutes] = useState(REPRESENTATIVE_ROUTES);
  const [selectedVersion, setSelectedVersion] = useState('v2026.2');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [editingRoute, setEditingRoute] = useState(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  const currentVersionObj = BASKET_VERSIONS.find(v => v.version === selectedVersion) || BASKET_VERSIONS[0];

  const filteredRoutes = routes.filter(r => {
    const matchesSearch = r.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.destCity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === 'ALL' || r.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const totalBasketWeight = routes.reduce((sum, r) => sum + r.basketWeightPct, 0).toFixed(2);

  const handleToggleWindow = (routeId, horizon) => {
    setRoutes(prev => prev.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          windows: {
            ...r.windows,
            [horizon]: !r.windows[horizon]
          }
        };
      }
      return r;
    }));
  };

  const handleSaveRoute = (e) => {
    e.preventDefault();
    if (!editingRoute) return;
    setRoutes(prev => prev.map(r => r.id === editingRoute.id ? editingRoute : r));
    setSavedNotice(`Updated corridor configuration for ${editingRoute.route}`);
    setTimeout(() => setSavedNotice(''), 3000);
    setEditingRoute(null);
  };

  return (
    <div className="space-y-6 text-[#111827] font-sans animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <PageHeader
        title="Route Basket & Advance Purchase Window Governance"
        description="Configuration and statistical governance of the representative 25 city-pairs, passenger traffic weights, and advance-purchase windows (T+1 to T+45) underpinning the APIx index."
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Plane className="w-3.5 h-3.5" />
            Basket Version: {selectedVersion} · Active
          </div>
        }
        actions={
          <ActionGuard permission="canConfigureMethodology" requiredRoleLabel="Policy Reviewer or Admin">
            <button
              onClick={() => setIsRevisionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Propose Basket Revision
            </button>
          </ActionGuard>
        }
        filters={
          <div className="flex items-center justify-between gap-3 flex-wrap w-full text-[13px]">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search route or city (e.g. BOM-DEL, Mumbai)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[13px] focus:outline-none focus:border-blue-500 w-64 text-[#111827]"
                />
              </div>

              {/* Basket Version Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#4B5563]">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold text-slate-500">Version:</span>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="bg-transparent font-bold text-[#111827] focus:outline-none cursor-pointer"
                >
                  {BASKET_VERSIONS.map(v => (
                    <option key={v.version} value={v.version}>
                      {v.version} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[13px] text-[#111827] focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL">All Aviation Regions</option>
                <option value="Trunk Metro">Trunk Metro Corridors</option>
                <option value="Metro-Metro">Metro-Metro</option>
                <option value="Metro-Tier2">Metro-Tier2</option>
                <option value="Leisure Trunk">Leisure Trunk</option>
                <option value="Southern Corridor">Southern Corridors</option>
              </select>
            </div>

            <span className="text-xs text-[#6B7280]">
              Showing <strong>{filteredRoutes.length}</strong> of {routes.length} corridors
            </span>
          </div>
        }
      />

      {/* Saved Notification */}
      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedNotice}
        </div>
      )}

      {/* Basket Metadata & Audit Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Basket Specification {currentVersionObj.version}</h2>
            <p className="text-slate-500 mt-0.5">{currentVersionObj.notes}</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
              Approved by {currentVersionObj.approvedBy} on {currentVersionObj.approvalDate}
            </span>
          </div>
        </div>

        {/* 4 Quick KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold">City-Pairs Included</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">{routes.length} Corridors</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Annual Passenger Volume</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">68.5M Pax / Year</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold">National Traffic Coverage</span>
            <p className="text-base font-bold text-emerald-700 mt-0.5">78.4% Scheduled Pax</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Normalized Basket Weight</span>
            <p className="text-base font-bold text-blue-700 mt-0.5">{totalBasketWeight}% (Target 100%)</p>
          </div>
        </div>
      </div>

      {/* Representative Routes Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[#4B5563] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-3">Corridor & Cities</th>
                <th className="py-3 px-3">Region</th>
                <th className="py-3 px-3">Annual Pax</th>
                <th className="py-3 px-3">Basket Weight</th>
                <th className="py-3 px-3">National Share</th>
                <th className="py-3 px-3">Advance Purchase Windows</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#111827]">
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Rank */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">
                    #{route.dgcaRank}
                  </td>

                  {/* Corridor */}
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 text-[13px]">{route.route}</p>
                    <p className="text-[11px] text-[#6B7280]">{route.originCity} ↔ {route.destCity}</p>
                  </td>

                  {/* Region */}
                  <td className="py-3 px-3 font-medium text-slate-600">
                    {route.region}
                  </td>

                  {/* Annual Pax */}
                  <td className="py-3 px-3 font-mono font-medium text-slate-800">
                    {route.annualPax.toLocaleString('en-IN')}
                  </td>

                  {/* Basket Weight */}
                  <td className="py-3 px-3">
                    <span className="font-bold font-mono text-blue-700 text-xs">
                      {route.basketWeightPct.toFixed(2)}%
                    </span>
                  </td>

                  {/* National Share */}
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {route.nationalSharePct.toFixed(2)}%
                  </td>

                  {/* Advance Windows */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {['T+1', 'T+7', 'T+15', 'T+30', 'T+45'].map(win => {
                        const isEnabled = route.windows[win];
                        return (
                          <ActionGuard key={win} permission="canConfigureMethodology" requiredRoleLabel="Policy Reviewer">
                            <button
                              onClick={() => handleToggleWindow(route.id, win)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                isEnabled
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                              }`}
                              title={`Click to ${isEnabled ? 'disable' : 'enable'} ${win} window`}
                            >
                              {win}
                            </button>
                          </ActionGuard>
                        );
                      })}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      route.collectionPriority.startsWith('P1')
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {route.collectionPriority.split(' ')[0]}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <ActionGuard permission="canConfigureMethodology" requiredRoleLabel="Policy Reviewer">
                      <button
                        onClick={() => setEditingRoute(route)}
                        className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                    </ActionGuard>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Route Modal */}
      {editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Corridor Configuration</h3>
                <p className="text-xs text-slate-500">{editingRoute.route} ({editingRoute.originCity} ↔ {editingRoute.destCity})</p>
              </div>
              <button
                onClick={() => setEditingRoute(null)}
                className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Basket Weight (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingRoute.basketWeightPct}
                  onChange={(e) => setEditingRoute({ ...editingRoute, basketWeightPct: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collection Priority</label>
                <select
                  value={editingRoute.collectionPriority}
                  onChange={(e) => setEditingRoute({ ...editingRoute, collectionPriority: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="P1 (Critical)">P1 (Critical - Every 15m)</option>
                  <option value="P2 (High)">P2 (High - Every 30m)</option>
                  <option value="P3 (Standard)">P3 (Standard - Every 60m)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status in Basket</label>
                <select
                  value={editingRoute.status}
                  onChange={(e) => setEditingRoute({ ...editingRoute, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="ACTIVE">ACTIVE (Contributes to headline APIx)</option>
                  <option value="INACTIVE">INACTIVE (Excluded from current weighting)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRoute(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose Revision Modal */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Initiate Basket Revision Proposal</h3>
                <p className="text-xs text-slate-500">Draft v2027.1 Route Re-weighting</p>
              </div>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Proposed changes will enter a <strong>Draft</strong> state requiring certification from the <strong>MoSPI National Accounts Committee</strong> and <strong>DGCA Directorate</strong> before superseding <code>v2026.2</code>.
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1">
                <p className="font-bold">Proposed Additions:</p>
                <p>• PNQ-BLR (Pune ↔ Bengaluru) - Rank 11 traffic</p>
                <p>• DEL-COK (Delhi ↔ Kochi) - Southern tourism trunk</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Draft revision v2027.1 created and submitted to Policy Reviewer queue.');
                    setIsRevisionModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
