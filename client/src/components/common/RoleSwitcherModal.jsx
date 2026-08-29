import React from 'react';
import { useRole } from '../../context/RoleContext';
import { X, CheckCircle, Shield, Briefcase, Scale, Sparkles } from 'lucide-react';

export const RoleSwitcherModal = () => {
  const { allRoles, activeRoleKey, setRole, isRoleModalOpen, setIsRoleModalOpen } = useRole();

  if (!isRoleModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Select Active Role & Persona</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The sidebar, metrics, and report permissions adapt dynamically to the selected role.
            </p>
          </div>
          <button
            onClick={() => setIsRoleModalOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Roles List */}
        <div className="space-y-3">
          {Object.entries(allRoles).map(([key, role]) => {
            const isSelected = activeRoleKey === key;

            return (
              <div
                key={key}
                onClick={() => {
                  setRole(key);
                  setIsRoleModalOpen(false);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={role.avatar}
                    alt={role.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{role.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                        {role.roleLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{role.title}</p>
                    <p className="text-[10px] text-slate-400">{role.department}</p>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Multi-Role RBAC System Enabled</span>
          <button
            onClick={() => setIsRoleModalOpen(false)}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
