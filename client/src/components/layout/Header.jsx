import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useAuditModal } from '../../context/AuditModalContext';
import { Calendar, Bell, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export const Header = () => {
  const { currentRole } = useRole();
  const { openCopilot, openHeadless } = useAuditModal();
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
      <div className="flex items-center gap-2.5">
        {/* Scraper Studio Button */}
        <button
          onClick={() => openHeadless({ route: 'BOM-DEL', horizon: 'T+1' })}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500/50 bg-slate-50 hover:bg-emerald-50 text-[12px] font-medium text-slate-700 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs group"
          title="Open Headless Scraper Simulation Studio"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span>Scraper Studio</span>
        </button>

        {/* AI Copilot Button */}
        <button
          onClick={() => openCopilot()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[12px] font-medium transition-all shadow-xs cursor-pointer group"
          title="Open AeroIntel AI Econometric Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200 group-hover:rotate-12 transition-transform" />
          <span>AI Copilot</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-0.5"></div>

        {/* Month / Date Selector */}
        <div className="relative hidden md:block">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[12px] font-medium text-[#111827] shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>August 2026</span>
          </div>
        </div>

        {/* Notifications */}
        <button 
          title="Data Verification & Pipeline Alerts"
          className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-[#4B5563] hover:bg-slate-50 relative transition-colors"
        >
          <Bell className="w-4 h-4 text-[#6B7280]" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-0.5"></div>

        {/* User Profile Persona Header */}
        <div className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-left">
          <img
            src={currentRole.avatar}
            alt={currentRole.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden lg:block">
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

