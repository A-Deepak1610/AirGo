import React from 'react';
import { useRole } from '../../context/RoleContext';
import { Plane, ChevronRight, RefreshCw, UserCheck, Shield } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentRole, setIsRoleModalOpen } = useRole();

  return (
    <aside className="w-64 bg-[#111827] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800/80 select-none z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/80 bg-[#0d131f]">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
          AII
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
            Airfare Intelligence
          </h1>
          <p className="text-[11px] text-slate-400 font-normal truncate">
            A DGCA & MoSPI Platform
          </p>
        </div>
      </div>

      {/* Navigation Sections (Dynamic & Role-Specific) */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {currentRole.sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {section.title}
            </h2>
            <div className="space-y-0.5 mt-1.5">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id || (activeTab === 'dashboard' && item.id === 'dashboard');

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer / Role & System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0d131f] space-y-3">
        {/* System Health */}
        <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-[10px] uppercase font-bold text-slate-400">DATA STATUS</span>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            All systems operational
          </div>
        </div>

        {/* User Card with Role Switch Trigger */}
        <div className="p-2 rounded-lg bg-slate-850 bg-slate-800/50 border border-slate-750 border-slate-700/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={currentRole.avatar}
              alt={currentRole.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-600"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{currentRole.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentRole.title}</p>
            </div>
          </div>
        </div>

        {/* Role Switcher Button */}
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-medium transition-all"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Switch Role / View</span>
        </button>
      </div>
    </aside>
  );
};
