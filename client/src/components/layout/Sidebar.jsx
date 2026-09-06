import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export const Sidebar = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col h-screen sticky top-0 border-r border-slate-200 select-none z-30 shrink-0 font-sans">
      {/* Brand Header */}
      <div
        onClick={() => navigate('/dashboard')}
        className="p-5 border-b border-slate-100 cursor-pointer flex items-center gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center font-mono shadow-2xs">
          AG
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-[#111827] tracking-tight leading-none">
            AirGo
          </h1>
          <p className="text-xs text-[#6B7280] font-normal tracking-tight mt-1">
            Airfare Index Platform
          </p>
        </div>
      </div>

      {/* Public Landing Portal Link */}
      <div className="px-3.5 pt-3 pb-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Public Portal & APIx</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400">HOME</span>
        </button>
      </div>

      {/* Dynamic Role Navigation Sections (Increased Width & Domain-Relevant Icons) */}
      <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-6 scrollbar-none">
        {currentRole.sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h2 className="px-3 text-[11px] font-medium text-[#6B7280] tracking-wider uppercase">
              {section.title}
            </h2>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/dashboard' && (location.pathname === '/' || location.pathname === ''));

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                        : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-50 font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />}
                      <span className="truncate text-left">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
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

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 text-xs text-[#6B7280] tracking-tight font-normal">
        MoSPI & DGCA compliant · Base 2024=100
      </div>
    </aside>
  );
};
