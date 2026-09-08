import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Key, 
  Lock, 
  Mail, 
  Building2, 
  Clock, 
  Shield, 
  Edit3, 
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionGuard } from '../components/common/ActionGuard';
import { RoleBadge } from '../components/common/RoleBadge';
import { useRole } from '../context/RoleContext';
import { PLATFORM_USERS, ROLE_PERMISSION_MATRIX, PERMISSION_DEFINITIONS } from '../data/usersRolesData';
import { ROLES } from '../config/roles';

export const UsersRolesPage = () => {
  const { hasPermission, activeRole } = useRole();
  const canManage = hasPermission('canManageUsers');

  const [activeTab, setActiveTab] = useState('users'); // users, matrix, security
  const [usersList, setUsersList] = useState(PLATFORM_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Modal state for provisioning new user
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    department: '',
    roleKey: 'DATA_ANALYST'
  });
  const [notice, setNotice] = useState('');

  // Filtering users
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (roleFilter === 'ALL') return matchesSearch;
    return matchesSearch && user.roleKey === roleFilter;
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.department) return;

    const roleObj = ROLES[newUser.roleKey] || { label: newUser.roleKey };
    const created = {
      id: `USR-00${usersList.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      department: newUser.department,
      roleKey: newUser.roleKey,
      roleLabel: roleObj.label,
      status: 'ACTIVE',
      lastActive: 'Just now',
      createdDate: new Date().toISOString().slice(0, 10),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
    };

    setUsersList([created, ...usersList]);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', department: '', roleKey: 'DATA_ANALYST' });
    setNotice(`User ${created.name} (${roleObj.label}) successfully provisioned.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleToggleStatus = (userId) => {
    setUsersList(usersList.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="User & Role Governance" 
          description="Role-Based Access Control (RBAC), institutional directory, and granular permission enforcement across all five functional tiers."
        />
        <div className="flex items-center gap-3">
          <ActionGuard
            requiredPermission="canManageUsers"
            tooltipText="Provision a new institutional user and assign RBAC tier"
          >
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Provision New User
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
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Platform Users</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{usersList.length}</div>
          <p className="text-xs text-slate-500 mt-1">Across 4 institutional departments</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Institutional Roles</span>
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">5 Defined Tiers</div>
          <p className="text-xs text-slate-500 mt-1">Admin, Eng, Analyst, Policy, Consumer</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">MFA Status</span>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">100% Enforced</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">FIDO2 / TOTP Hardware Keys</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Session Policy</span>
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">15 min Timeout</div>
          <p className="text-xs text-slate-500 mt-1">Automatic revocation on idle</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          User Accounts Directory ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="w-4 h-4" />
          Role-Permission Matrix (5 Roles)
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Security & Identity Policies
        </button>
      </div>

      {/* Tab 1: User Directory */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  roleFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Roles
              </button>
              {Object.entries(ROLES).map(([k, r]) => (
                <button
                  key={k}
                  onClick={() => setRoleFilter(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    roleFilter === k
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Institutional Department</th>
                    <th className="py-3 px-4">Active Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{user.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-700 font-medium">{user.department}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <RoleBadge roleKey={user.roleKey} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {user.lastActive}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <ActionGuard
                          requiredPermission="canManageUsers"
                          tooltipText="Administrative role override & account status modification"
                        >
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </ActionGuard>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Role Permission Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Statutory Principle of Least Privilege:</span> Functional entitlements are enforced at both the API gateway and the frontend view layers. Critical operational actions (e.g. approving official index releases or remediating anomalous airfares) require elevated roles.
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-1/3">Functional Permission</th>
                    <th className="py-3.5 px-3 text-center">Platform Admin</th>
                    <th className="py-3.5 px-3 text-center">Data Engineer</th>
                    <th className="py-3.5 px-3 text-center">Data Analyst</th>
                    <th className="py-3.5 px-3 text-center">Policy / Reviewer</th>
                    <th className="py-3.5 px-3 text-center">API Consumer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {ROLE_PERMISSION_MATRIX.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 text-xs">{item.permission}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.key}</div>
                      </td>
                      {['PLATFORM_ADMIN', 'DATA_ENGINEER', 'DATA_ANALYST', 'POLICY_REVIEWER', 'API_CONSUMER'].map(role => (
                        <td key={role} className="py-3 px-3 text-center">
                          {item[role] ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono font-bold text-base">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Policies */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Identity Federation & Single Sign-On
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AirGo delegates user authentication to institutional identity providers via SAML 2.0 and OpenID Connect (OIDC).
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">DGCA Gateway IdP</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Bound
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">NIC / MoSPI GovCloud SSO</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Bound
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">RBI Corporate Directory</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Bound
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Network & Session Restrictions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict network perimeter and transport layer constraints for non-public API and administrative interactions.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">Session Inactivity Timeout</span>
                <span className="font-mono font-semibold text-slate-800">15 minutes</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">Concurrent Sessions per User</span>
                <span className="font-mono font-semibold text-slate-800">1 Active Device</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">IP Whitelist Range</span>
                <span className="font-mono font-semibold text-slate-800">10.0.0.0/8 (Gov VPN)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Provision Institutional User</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Verma"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@gov.in or name@rbi.org.in"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MoSPI Price Statistics Wing"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Role</label>
                <select
                  value={newUser.roleKey}
                  onChange={(e) => setNewUser({ ...newUser, roleKey: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {Object.entries(ROLES).map(([key, r]) => (
                    <option key={key} value={key}>{r.label} ({key})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Assigning elevated roles (Platform Admin, Policy Reviewer) grants immutable audit and parameter override permissions.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
