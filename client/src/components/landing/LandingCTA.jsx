import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plane } from 'lucide-react';

export const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* FINAL STATEMENT & CTA */}
      <section className="py-28 sm:py-36 bg-white border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              India's airfare market is always moving.
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-blue-600">
              Now we can measure it.
            </p>
          </div>

          <p className="text-base sm:text-lg text-slate-600 font-normal max-w-xl mx-auto leading-relaxed">
            High-frequency price transparency for researchers, economists, and civil aviation authorities.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <span>Explore the Platform</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/index-apix')}
              className="px-8 py-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base transition-colors shadow-2xs cursor-pointer"
            >
              <span>View the Index</span>
            </button>
          </div>

        </div>
      </section>

      {/* MINIMAL EDITORIAL FOOTER */}
      <footer className="bg-slate-900 text-white py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  Airfare Intelligence Platform
                </span>
                <span className="text-xs text-slate-400">
                  Real-time Airfare Price Index (APIx) for India
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
              <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">
                Terminal
              </button>
              <button onClick={() => navigate('/index-apix')} className="hover:text-white transition-colors cursor-pointer">
                Index
              </button>
              <button onClick={() => navigate('/analytics')} className="hover:text-white transition-colors cursor-pointer">
                Analytics
              </button>
              <button onClick={() => navigate('/system-status')} className="hover:text-white transition-colors cursor-pointer">
                System
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              MoSPI & DGCA Compliant · Base 2024 = 100.0
            </div>

          </div>
        </div>
      </footer>
    </>
  );
};
