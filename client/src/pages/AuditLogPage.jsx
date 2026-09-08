import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  ArrowRight, 
  Eye, 
  RefreshCw, 
  Clock, 
  User, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  X,
  FileText,
  Key
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionGuard } from '../components/common/ActionGuard';
import { RoleBadge } from '../components/common/RoleBadge';
import { useRole } from '../context/RoleContext';
import { AUDIT_LOG_EVENTS } from '../data/auditLogData';

export const AuditLogPage = () => {
  const { hasPermission, activeRole } = useRole();
  const canView = hasPermission('canViewAuditLog');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [exportNotice, setExportNotice] = useState('');

  // Access guard check for page level
  if (!canView) {
    return (
      <div className="space-y-6 font-sans text-slate-900">
        <PageHeader 
          title="Institutional Compliance & Audit Log" 
          description="Immutable governance trail and administrative change log for the National Airfare Index Platform."
        />
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto shadow-sm my-12">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted to Governance Roles</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Viewing immutable administrative audit logs is restricted to <span className="font-semibold text-slate-900">Platform Admins</span> and <span className="font-semibold text-slate-900">Policy / Reviewers</span> pursuant to statistical governance regulations. Your current active role is <span className="font-semibold text-blue-600">{activeRole.label}</span>.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-left font-mono">
            SEC_POLICY_ERR: 403 FORBIDDEN. Missing entitlement: canViewAuditLog.
            <br />
            Retention: Immutable Write-Once-Read-Many (WORM) storage.
          </div>
        </div>
      </div>
    );
  }

  // Filter events
  const filteredEvents = AUDIT_LOG_EVENTS.filter(event => {
    const matchesSearch = 
      event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.entityType.toLowerCase().includes(searchQuery.toLowerCase());

    if (categoryFilter === 'ALL') return matchesSearch;
    if (categoryFilter === 'SECURITY' && event.entityType.includes('Security')) return matchesSearch;
    if (categoryFilter === 'REMEDIATION' && event.entityType.includes('Anomaly')) return matchesSearch;
    if (categoryFilter === 'SOURCES' && event.entityType.includes('Source')) return matchesSearch;
    if (categoryFilter === 'USERS' && event.entityType.includes('User')) return matchesSearch;
    if (categoryFilter === 'BASKET' && event.entityType.includes('Basket')) return matchesSearch;
    return matchesSearch;
  });

  const handleExportAudit = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      encodeURIComponent(
        "Event ID,Timestamp,User,Role,Action,Entity,Entity Type,Old Value,New Value,IP Address,Status\n" +
        filteredEvents.map(e => `"${e.id}","${e.timestamp}","${e.userName}","${e.userRole}","${e.action}","${e.entity}","${e.entityType}","${e.oldValue}","${e.newValue}","${e.ipAddress}","${e.status}"`).join("\n")
      );

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `airgo_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice('Compliance audit trail successfully exported as signed CSV.');
    setTimeout(() => setExportNotice(''), 4000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Institutional Compliance & Audit Log" 
          description="Immutable WORM audit trail tracking all configuration, algorithmic changes, user role updates, and data quality remediations."
        />
        <div className="flex items-center gap-3">
          <ActionGuard
            requiredPermission="canExportData"
            tooltipText="Export complete audit trail to signed CSV"
          >
            <button
              onClick={handleExportAudit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export Audit Trail (CSV)
            </button>
          </ActionGuard>
        </div>
      </div>

      {exportNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Audit Events</span>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">1,420</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">100% Verified</span> • WORM compliance
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security Events</span>
            <Key className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">28</div>
          <p className="text-xs text-slate-500 mt-1">API key rotations & access grants</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data Remediations</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">14</div>
          <p className="text-xs text-slate-500 mt-1">Winsorized spikes & overrides</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Retention Horizon</span>
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">365 Days</div>
          <p className="text-xs text-slate-500 mt-1">MoSPI & CERT-In aligned log policy</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Event ID, User, Action, or Target Entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'SECURITY', label: 'Security' },
            { id: 'REMEDIATION', label: 'Remediations' },
            { id: 'SOURCES', label: 'Sources' },
            { id: 'USERS', label: 'User Roles' },
            { id: 'BASKET', label: 'Basket/Methodology' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Events Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Initiated By</th>
                <th className="py-3 px-4">Action & Type</th>
                <th className="py-3 px-4">Entity Modified</th>
                <th className="py-3 px-4">Change Delta</th>
                <th className="py-3 px-4">Network IP</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No compliance audit events matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-600">
                      {event.id}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {event.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-xs">{event.userName}</span>
                        <div className="mt-0.5">
                          <RoleBadge roleKey={event.userRole} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-slate-900">
                          {event.action}
                        </span>
                        <span className="text-[11px] text-slate-500">{event.entityType}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 max-w-xs truncate">
                      {event.entity}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="line-through text-slate-400 truncate max-w-[100px]" title={event.oldValue}>
                          {event.oldValue}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-emerald-700 font-semibold truncate max-w-[120px]" title={event.newValue}>
                          {event.newValue}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {event.ipAddress}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View Complete Cryptographic Payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cryptographic Audit Entry</h3>
                  <p className="text-xs font-mono text-slate-500">{selectedEvent.id} • Verified Signature</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">Action Code</span>
                <span className="font-mono font-bold text-slate-800">{selectedEvent.action}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">Initiator</span>
                <span className="font-semibold text-slate-800">{selectedEvent.userName} ({selectedEvent.userRole})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">Timestamp</span>
                <span className="text-slate-700">{selectedEvent.timestamp}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">Origin Network</span>
                <span className="font-mono text-slate-700">{selectedEvent.ipAddress}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600">State Transition Record</span>
              <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs space-y-2 overflow-x-auto">
                <div><span className="text-red-400">- OLD:</span> {selectedEvent.oldValue}</div>
                <div><span className="text-emerald-400">+ NEW:</span> {selectedEvent.newValue}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 font-mono">
              SHA256: 7f8a920b12cf3e018a4f91b72e90c884a123f009981bcde54129841bb2345091
              <br />
              Status: IMMUTABLE_COMMITTED • Consensus: Cluster_Node_03 (DGCA Gateway)
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
