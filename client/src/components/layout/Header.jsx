import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { Calendar, Clock, Bell, ShieldCheck } from 'lucide-react';

export const Header = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const getCrumb = () => {
    switch (location.pathname) {
      case '/data-collection':
        return 'Data Collection';
      case '/airfare-data':
        return 'Airfare Data';
      case '/index-apix':
        return 'Index / APIx';
      case '/analytics':
        return 'Analytics';
      case '/backtesting':
        return 'Back-testing';
      case '/system-status':
        return 'System/API Status';
      default:
        if (location.pathname.startsWith('/index/routes/')) {
          return 'Corridor Analysis';
        }
        return 'Dashboard';
    }
  };

  const crumb = getCrumb();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Institutional Platform Identifier & Breadcrumb Context */}
      <div className="flex items-center gap-2.5">
        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[11px] tracking-wider shrink-0 font-mono">
          SIH26056
        </span>
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium">
          <button 
            onClick={() => navigate('/dashboard')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            AirGo
          </button>
          <span>/</span>
          <span className="text-[#111827] font-semibold">{crumb}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Month / Date Selector */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[13px] font-medium text-[#111827] shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>August 2026</span>
          </div>
        </div>

        {/* History / Refresh */}
        <button 
          title="Live refresh interval: 15 minutes"
          className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-[#4B5563] hover:bg-slate-50 transition-colors"
        >
          <Clock className="w-4 h-4 text-[#6B7280]" />
        </button>

        {/* Notifications */}
        <button 
          title="Data Verification & Pipeline Alerts"
          className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-[#4B5563] hover:bg-slate-50 relative transition-colors"
        >
          <Bell className="w-4 h-4 text-[#6B7280]" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Profile Persona Header */}
        <div className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-left">
          <img
            src={currentRole.avatar}
            alt={currentRole.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden sm:block">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-[#111827] leading-tight">{currentRole.name}</p>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-[11px] text-[#6B7280] font-normal">{currentRole.title}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
