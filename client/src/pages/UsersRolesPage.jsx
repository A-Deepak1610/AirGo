import React from 'react';
import { useRole } from '../context/RoleContext';
import { Shield, UserCheck, Users, CheckCircle } from 'lucide-react';

export const UsersRolesPage = () => {
  const { allRoles, activeRoleKey, setRole } = useRole();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Role-Based Access Control (RBAC) & User Management
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Configure agency permissions for MoSPI statistical officers, DGCA tariff auditors, and RBI monetary policy teams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(allRoles).map(([key, role]) => {
          const isSelected = activeRoleKey === key;
          return (
            <div
              key={key}
              onClick={() => setRole(key)}
              className={`bg-white border rounded-2xl p-5 shadow-2xs cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                isSelected ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={role.avatar} alt={role.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{role.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{role.title}</p>
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                    {role.roleLabel}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">{role.department}</span>
                {isSelected ? (
                  <span className="text-blue-600 flex items-center gap-1 font-bold">
                    <CheckCircle className="w-4 h-4" /> Active Persona
                  </span>
                ) : (
                  <span className="text-slate-400 hover:text-slate-700">Click to Activate</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
