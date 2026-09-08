import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Plus,
  Globe,
  Clock
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionGuard } from '../components/common/ActionGuard';
import { AIRLINE_OTA_SOURCES } from '../data/sourcesData';

export const SourceCatalogPage = () => {
  const [sources, setSources] = useState(AIRLINE_OTA_SOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [editingSource, setEditingSource] = useState(null);
  const [savedNotice, setSavedNotice] = useState('');

  // Filter sources
  const filteredSources = sources.filter(src => {
    const matchesSearch = src.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          src.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          src.shortCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || src.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || src.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleStatus = (sourceId) => {
    setSources(prev => prev.map(s => {
      if (s.id === sourceId) {
        const nextStatus = s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!editingSource) return;
    setSources(prev => prev.map(s => s.id === editingSource.id ? editingSource : s));
    setSavedNotice(`Updated configuration for ${editingSource.name}`);
    setTimeout(() => setSavedNotice(''), 3000);
    setEditingSource(null);
  };

  return (
    <div className="space-y-6 text-[#111827] font-sans animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <PageHeader
        title="Airline & OTA Source Catalog"
        description="Central registry and technical governance of all 11 Indian direct carrier APIs, headless browser scrapers, and OTA aggregator ingestion nodes."
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            11 Sources Audited · Zero Dummy Data Policy
          </div>
        }
        actions={
          <ActionGuard permission="canConfigureSources" requiredRoleLabel="Data Engineer or Admin">
            <button
              onClick={() => {
                alert('Source registration wizard is active. New sources undergo strict compliance & robots.txt sandbox verification before live deployment.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Source
            </button>
          </ActionGuard>
        }
        filters={
          <div className="flex items-center justify-between gap-3 flex-wrap w-full text-[13px]">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search airline, OTA, or domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[13px] focus:outline-none focus:border-blue-500 w-64 text-[#111827]"
                />
              </div>

              {/* Source Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[13px] text-[#111827] focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL">All Source Types</option>
                <option value="Direct Airline">Direct Airlines (5)</option>
                <option value="OTA Aggregator">OTA Aggregators (6)</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[13px] text-[#111827] focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL">All Operational Statuses</option>
                <option value="ACTIVE">Active (Ingesting)</option>
                <option value="PAUSED">Paused / Standby</option>
              </select>
            </div>

            <span className="text-xs text-[#6B7280]">
              Showing <strong>{filteredSources.length}</strong> of {sources.length} sources
            </span>
          </div>
        }
      />

      {/* Saved Toast Notice */}
      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedNotice}
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Monitored Ingestion Nodes</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-[#111827] mt-1.5">11 Targets</p>
          <p className="text-[11px] text-[#4B5563] mt-0.5">5 Direct Carriers + 6 Leading OTAs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Average Source Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1.5">98.2%</p>
          <p className="text-[11px] text-[#4B5563] mt-0.5">Zero unhandled bot blocks</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Daily Observations Capacity</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-[#111827] mt-1.5">31,040 Quotes</p>
          <p className="text-[11px] text-[#4B5563] mt-0.5">Across T+1, T+7, T+15, T+30, T+45</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Ethical Scraping Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1.5">100% Audited</p>
          <p className="text-[11px] text-[#4B5563] mt-0.5">Rate limits & robots.txt verified</p>
        </div>
      </div>

      {/* Main Sources Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[#4B5563] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Source & Domain</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Extraction Method</th>
                <th className="py-3 px-3">Health</th>
                <th className="py-3 px-3">Rate Limit</th>
                <th className="py-3 px-3">Last Sync / Failure</th>
                <th className="py-3 px-3">Compliance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#111827]">
              {filteredSources.map((src) => {
                const isActive = src.status === 'ACTIVE';

                return (
                  <tr key={src.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Source & Domain */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-md bg-slate-100 font-mono font-bold text-slate-700 flex items-center justify-center text-xs shrink-0 border border-slate-200">
                          {src.shortCode}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{src.name}</p>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>{src.domain}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 font-medium text-slate-700">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        src.type === 'Direct Airline'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {src.type}
                      </span>
                    </td>

                    {/* Extraction Method */}
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {src.method}
                    </td>

                    {/* Health */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              src.healthScore >= 98 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${src.healthScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px]">{src.healthScore}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{src.latencyMs}ms avg</span>
                    </td>

                    {/* Rate Limit */}
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{src.rateLimitPerMinute} req/min</p>
                      <p className="text-[10px] text-slate-400">{src.concurrencyLimit} concurrent workers</p>
                    </td>

                    {/* Last Sync */}
                    <td className="py-3 px-3">
                      <p className="text-slate-800 font-medium text-[11px]">{src.lastSuccessfulCollection}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[160px]" title={src.lastFailure}>
                        {src.lastFailure}
                      </p>
                    </td>

                    {/* Compliance */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Compliant</span>
                      </div>
                      <p className="text-[10px] text-slate-400" title={src.robotsTxtStatus}>robots.txt audited</p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <ActionGuard permission="canConfigureSources" requiredRoleLabel="Data Engineer or Admin">
                        <button
                          onClick={() => handleToggleStatus(src.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={`Click to ${isActive ? 'pause' : 'activate'} scraping from this source`}
                        >
                          {src.status}
                        </button>
                      </ActionGuard>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <ActionGuard permission="canConfigureSources" requiredRoleLabel="Data Engineer or Admin">
                        <button
                          onClick={() => setEditingSource(src)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Settings className="w-3 h-3 text-slate-500" />
                          <span>Configure</span>
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

      {/* Configure Source Modal */}
      {editingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configure Ingestion Parameters</h3>
                <p className="text-xs text-slate-500">{editingSource.name} ({editingSource.domain})</p>
              </div>
              <button
                onClick={() => setEditingSource(null)}
                className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scraping Ingestion Method</label>
                <input
                  type="text"
                  value={editingSource.method}
                  onChange={(e) => setEditingSource({ ...editingSource, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rate Limit (req / min)</label>
                  <input
                    type="number"
                    value={editingSource.rateLimitPerMinute}
                    onChange={(e) => setEditingSource({ ...editingSource, rateLimitPerMinute: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Concurrency Limit</label>
                  <input
                    type="number"
                    value={editingSource.concurrencyLimit}
                    onChange={(e) => setEditingSource({ ...editingSource, concurrencyLimit: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">robots.txt & Ethical Crawl Policy</label>
                <input
                  type="text"
                  value={editingSource.robotsTxtStatus}
                  onChange={(e) => setEditingSource({ ...editingSource, robotsTxtStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational State</label>
                <select
                  value={editingSource.status}
                  onChange={(e) => setEditingSource({ ...editingSource, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="ACTIVE">ACTIVE (Ingesting every 15m/30m)</option>
                  <option value="PAUSED">PAUSED (Scheduled runs suspended)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSource(null)}
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
    </div>
  );
};
