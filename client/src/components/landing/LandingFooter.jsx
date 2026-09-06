import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity } from 'lucide-react';

export const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#060911] border-t border-slate-800/80 text-slate-400">
      {/* Final Call to Action Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SIH26056 · Smart India Hackathon</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-sans max-w-2xl mx-auto">
          See India's Airfare Market in Motion.
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Explore route-level airfare trends, lead-time elasticity curves, and the official Real-time Airfare Price Index (APIx).
        </p>

        <div className="pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      {/* Institutional Compliance & Credits Bar */}
      <div className="border-t border-slate-800/80 bg-[#05070D] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">AirGo</span>
            <span>· Real-time Airfare Price Index for India</span>
          </div>

          <div className="text-slate-500 text-center sm:text-right text-[11px]">
            Ministry of Statistics & Programme Implementation (MoSPI) · Directorate General of Civil Aviation (DGCA)
          </div>
        </div>
      </div>
    </footer>
  );
};
