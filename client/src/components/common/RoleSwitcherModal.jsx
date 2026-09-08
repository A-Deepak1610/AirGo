import React from 'react';
import { X, ShieldCheck, Check, UserCheck, Key, Database, Activity, FileCheck, Layers } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { USER_ROLES } from '../../config/roles';

export const RoleSwitcherModal = () => {
  const { currentRole, activeRoleKey, setRole, isRoleModalOpen, setIsRoleModalOpen } = useRole();

  if (!isRoleModalOpen) return null;

  const rolesList = Object.entries(USER_ROLES).filter(([key]) => 
    key === 'PLATFORM_ADMIN' || 
    key === 'DATA_ENGINEER' || 
    key === 'DATA_ANALYST' || 
    key === 'POLICY_REVIEWER' || 
    key === 'API_CONSUMER'
  );

  const getRoleIcon = (key) => {
    switch (key) {
      case 'PLATFORM_ADMIN': return <ShieldCheck className="w-5 h-5 text-rose-600" />;
      case 'DATA_ENGINEER': return <Database className="w-5 h-5 text-emerald-600" />;
      case 'DATA_ANALYST': return <Activity className="w-5 h-5 text-blue-600" />;
      case 'POLICY_REVIEWER': return <FileCheck className="w-5 h-5 text-indigo-600" />;
      case 'API_CONSUMER': return <Key className="w-5 h-5 text-amber-600" />;
      default: return <UserCheck className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Switch Institutional Persona</h2>
              <p className="text-xs text-slate-500">Test platform views, dynamic navigation, and role-based permissions.</p>
            </div>
          </div>
          <button
            onClick={() => setIsRoleModalOpen(false)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {rolesList.map(([roleKey, role]) => {
            const isSelected = activeRoleKey === roleKey;

            return (
              <div
                key={roleKey}
                onClick={() => {
                  setRole(roleKey);
                  setIsRoleModalOpen(false);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <img
                  src={role.avatar}
                  alt={role.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{role.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                        {role.roleLabel}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                        <Check className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium mt-0.5">{role.title} · {role.department}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">{role.description}</p>

                  <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[10px]">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Access Scope:</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {role.allowedPathPrefixes?.length || 0} Modules Authorized
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Current active role: <strong className="text-slate-900">{currentRole.roleLabel}</strong></span>
          <button
            onClick={() => setIsRoleModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
