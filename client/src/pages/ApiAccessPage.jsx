import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Plus, 
  Code2, 
  Activity, 
  Clock, 
  Server, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Trash2,
  Terminal,
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionGuard } from '../components/common/ActionGuard';
import { useRole } from '../context/RoleContext';
import { API_CONSUMER_KEYS, API_ENDPOINTS_DOCUMENTATION } from '../data/apiAccessData';

export const ApiAccessPage = () => {
  const { hasPermission } = useRole();
  const canManage = hasPermission('canManageApiKeys');

  const [activeTab, setActiveTab] = useState('keys'); // keys, docs, quotas
  const [keysList, setKeysList] = useState(API_CONSUMER_KEYS);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newKeyClient, setNewKeyClient] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('apix:read');
  const [newKeyQuota, setNewKeyQuota] = useState(25000);
  const [notice, setNotice] = useState('');
  const [expandedEndpoint, setExpandedEndpoint] = useState(API_ENDPOINTS_DOCUMENTATION[0].path);

  const handleCopyKey = (keyId, keyPrefix) => {
    navigator.clipboard.writeText(`${keyPrefix}DEMO_TOKEN_SECRET_9921`);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!newKeyClient) return;

    const generated = {
      id: `KEY-${Date.now().toString().slice(-4)}`,
      clientName: newKeyClient,
      keyPrefix: `ag_live_${newKeyClient.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5)}_${Math.random().toString(36).slice(2, 6)}...`,
      status: 'ACTIVE',
      scopes: [newKeyScope],
      rateLimitPerMin: 120,
      dailyQuota: Number(newKeyQuota),
      monthlyRequests: 0,
      lastUsed: 'Never',
      createdAt: new Date().toISOString().slice(0, 10),
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      contactEmail: `api@${newKeyClient.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov.in`
    };

    setKeysList([generated, ...keysList]);
    setShowGenerateModal(false);
    setNewKeyClient('');
    setNotice(`API Key successfully generated for ${generated.clientName}.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleRotateKey = (keyId) => {
    setKeysList(keysList.map(k => {
      if (k.id === keyId) {
        return {
          ...k,
          keyPrefix: `ag_live_${k.clientName.toLowerCase().slice(0, 4)}_${Math.random().toString(36).slice(2, 6)}...`,
          lastUsed: 'Rotated just now'
        };
      }
      return k;
    }));
    setNotice(`Security key rotation completed for key ${keyId}.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleToggleRevoke = (keyId) => {
    setKeysList(keysList.map(k => {
      if (k.id === keyId) {
        return {
          ...k,
          status: k.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
        };
      }
      return k;
    }));
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Institutional API Gateway & Access Keys" 
          description="Provisioning, rate-limiting, and REST API documentation for institutional consumers including RBI, MoSPI, and DGCA."
        />
        <div className="flex items-center gap-3">
          <ActionGuard
            requiredPermission="canManageApiKeys"
            tooltipText="Issue a new cryptographic API access token"
          >
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate API Key
            </button>
          </ActionGuard>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active API Keys</span>
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {keysList.filter(k => k.status === 'ACTIVE').length} Active
          </div>
          <p className="text-xs text-slate-500 mt-1">{keysList.length} total provisioned credentials</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Call Volume</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">1.25 Million</div>
          <p className="text-xs text-slate-500 mt-1">+14.2% MoM consumption</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Edge Latency (p95)</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">42 ms</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Direct CDN Cache Hit</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Service SLA</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">99.98%</div>
          <p className="text-xs text-slate-500 mt-1">High Availability Government Tier</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('keys')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'keys'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="w-4 h-4" />
          Authorized Consumer Keys ({keysList.length})
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'docs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Code2 className="w-4 h-4" />
          REST API Reference & Endpoints
        </button>
        <button
          onClick={() => setActiveTab('quotas')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'quotas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Server className="w-4 h-4" />
          Gateway Rate Limits & Quotas
        </button>
      </div>

      {/* Tab 1: Keys List */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Client Institution</th>
                    <th className="py-3 px-4">API Key Token</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Authorized Scopes</th>
                    <th className="py-3 px-4">Rate Limits</th>
                    <th className="py-3 px-4">Monthly Usage</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {keysList.map(key => (
                    <tr key={key.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-xs">{key.clientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{key.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 w-fit">
                          <span>{key.keyPrefix}</span>
                          <button
                            onClick={() => handleCopyKey(key.id, key.keyPrefix)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="Copy API Token"
                          >
                            {copiedKeyId === key.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          key.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {key.scopes.map(scope => (
                            <span key={scope} className="font-mono text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                              {scope}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                        <div>{key.rateLimitPerMin} req/min</div>
                        <div className="text-[10px] text-slate-400">Quota: {key.dailyQuota.toLocaleString()} / day</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
                        {key.monthlyRequests.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {key.lastUsed}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionGuard
                            requiredPermission="canManageApiKeys"
                            tooltipText="Rotate cryptographic secret key"
                          >
                            <button
                              onClick={() => handleRotateKey(key.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Rotate Key"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </ActionGuard>
                          <ActionGuard
                            requiredPermission="canManageApiKeys"
                            tooltipText="Revoke or restore API key access"
                          >
                            <button
                              onClick={() => handleToggleRevoke(key.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title={key.status === 'ACTIVE' ? 'Revoke Access' : 'Reactivate Key'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </ActionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: API Documentation */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              API Gateway Base URL
            </div>
            <div className="font-mono text-sm font-bold bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 text-emerald-400 flex items-center justify-between">
              <span>https://airgo.gov.in/api/v1</span>
              <span className="text-xs text-slate-400 font-normal">Bearer Token Authentication (RFC 6750)</span>
            </div>
          </div>

          <div className="space-y-4">
            {API_ENDPOINTS_DOCUMENTATION.map(endpoint => {
              const isExpanded = expandedEndpoint === endpoint.path;
              return (
                <div key={endpoint.path} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div 
                    onClick={() => setExpandedEndpoint(isExpanded ? null : endpoint.path)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                        {endpoint.method}
                      </span>
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {endpoint.path}
                      </span>
                      <span className="text-xs text-slate-500 hidden md:inline">
                        — {endpoint.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                        {endpoint.requiredScope}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                      <p className="text-slate-600 text-xs leading-relaxed">{endpoint.description}</p>

                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2 uppercase text-[10px] tracking-wider">Query Parameters</h4>
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">Parameter</th>
                                <th className="p-2.5">Type</th>
                                <th className="p-2.5">Required</th>
                                <th className="p-2.5">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                              {endpoint.queryParams.map(param => (
                                <tr key={param.name}>
                                  <td className="p-2.5 font-bold text-slate-900">{param.name}</td>
                                  <td className="p-2.5 text-blue-600">{param.type}</td>
                                  <td className="p-2.5">{param.required ? <span className="text-red-500 font-bold">Yes</span> : <span className="text-slate-400">No</span>}</td>
                                  <td className="p-2.5 font-sans text-slate-600">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2 uppercase text-[10px] tracking-wider">Sample cURL Request</h4>
                        <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                          {endpoint.sampleCurl}
                        </pre>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2 uppercase text-[10px] tracking-wider">Response Payload (HTTP 200 OK)</h4>
                        <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                          {JSON.stringify(endpoint.sampleResponse, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Quotas & Limits */}
      {activeTab === 'quotas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Gateway Rate-Limiting Policy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AirGo employs token bucket rate-limiting algorithms at the edge load balancers to protect backend pipelines and maintain high availability.
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Institutional Priority Tier (MoSPI / DGCA / RBI)</div>
                <div className="text-slate-500">Up to 500 req/minute, burst up to 1,000 req/minute. Guaranteed zero throttling for scheduled nowcasts.</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Academic & Research Tier (IIMs / IITs)</div>
                <div className="text-slate-500">Up to 60 req/minute, daily quota 5,000 calls. Non-peak execution suggested.</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Security & Header Specifications
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All API requests must be transmitted via HTTPS TLS 1.3 with mandatory integrity headers.
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-500">Authorization:</span>
                <span className="text-slate-800 font-bold">Bearer &lt;API_KEY&gt;</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-500">Accept:</span>
                <span className="text-slate-800 font-bold">application/json</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-500">X-AirGo-Client-ID:</span>
                <span className="text-slate-800 font-bold">KEY-RBI-001</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Provision API Key</h3>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consumer Institution Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NITI Aayog Infrastructure Cell"
                  value={newKeyClient}
                  onChange={(e) => setNewKeyClient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Scope Entitlement</label>
                <select
                  value={newKeyScope}
                  onChange={(e) => setNewKeyScope(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="apix:read">apix:read (Headline APIx Index & Changes)</option>
                  <option value="quotes:read">quotes:read (Disaggregated Airfare Quotes)</option>
                  <option value="elasticity:read">elasticity:read (Route Elasticities & Advance Curves)</option>
                  <option value="reports:all">reports:all (MoSPI Official Ingestion Feeds)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Daily Request Quota</label>
                <select
                  value={newKeyQuota}
                  onChange={(e) => setNewKeyQuota(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={5000}>5,000 calls / day (Academic)</option>
                  <option value={25000}>25,000 calls / day (Standard Institutional)</option>
                  <option value={50000}>50,000 calls / day (MoSPI / Central Bank)</option>
                  <option value={100000}>100,000 calls / day (Full Administrative)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>API keys have full read access to confidential statistical nowcasts. Store securely and rotate annually.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
