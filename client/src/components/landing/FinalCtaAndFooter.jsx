import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plane, ShieldCheck, ExternalLink, Code2, Database, Layers } from 'lucide-react';

export const FinalCtaAndFooter = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* FINAL CTA SECTION */}
      <section className="py-20 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <span>GET STARTED TODAY</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Turn millions of fare quotes into one trusted price signal.
          </h2>

          <p className="text-lg text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            A modern airfare intelligence layer for researchers, analysts and policy makers.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/index-apix')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>Explore Airfare Index</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#architecture"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base transition-colors shadow-2xs"
            >
              <span>View System Architecture</span>
            </a>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base transition-colors shadow-2xs cursor-pointer"
            >
              <span>Open Operational Terminal</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span>✓ Open REST API Feeds</span>
            <span>·</span>
            <span>✓ Zero Synthetic Fallbacks</span>
            <span>·</span>
            <span>✓ 100% Audited DGCA Corridors</span>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            
            {/* Brand Column (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  <Plane className="w-5 h-5 -rotate-45" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white tracking-tight leading-none">
                    Airfare Intelligence Platform
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time Airfare Price Index (APIx) for India
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Autonomous scraping, normalization, and econometric index calculation across scheduled Indian domestic airlines and online travel aggregators.
              </p>

              <div className="text-[11px] font-mono text-slate-500">
                SIH26056 Research Consortium · Base Year 2024 = 100.0
              </div>
            </div>

            {/* Links Column 1: Platform */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-200 uppercase tracking-wider font-mono text-[11px]">
                Platform
              </div>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">
                    Live Operational Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/index-apix')} className="hover:text-white transition-colors cursor-pointer">
                    APIx Price Index Terminal
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/analytics')} className="hover:text-white transition-colors cursor-pointer">
                    Lead-Time Elasticity
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/data-collection')} className="hover:text-white transition-colors cursor-pointer">
                    Scraper Crawler Monitor
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/airfare-data')} className="hover:text-white transition-colors cursor-pointer">
                    Raw Data Explorer
                  </button>
                </li>
              </ul>
            </div>

            {/* Links Column 2: Architecture & Methodology */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-200 uppercase tracking-wider font-mono text-[11px]">
                Methodology
              </div>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#pipeline" className="hover:text-white transition-colors">7-Stage Normalization</a></li>
                <li><a href="#dynamic-pricing" className="hover:text-white transition-colors">24h Volatility Sampling</a></li>
                <li><a href="#network" className="hover:text-white transition-colors">DGCA 20 Trunk Hubs</a></li>
                <li><a href="#backtest" className="hover:text-white transition-colors">30-Day Historical Backtest</a></li>
                <li><a href="#architecture" className="hover:text-white transition-colors">Data Provenance & Audit</a></li>
              </ul>
            </div>

            {/* Links Column 3: Technologies */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-200 uppercase tracking-wider font-mono text-[11px]">
                Technology
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">React 19</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Three.js</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Python 3.11</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Playwright</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">PostgreSQL</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">FastAPI</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                Built for high-frequency airfare intelligence.
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Compliance Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 Airfare Intelligence Platform · Directorate General of Civil Aviation (DGCA) & MoSPI Compliant.
            </div>

            <div className="flex items-center gap-6 text-[11px] font-mono">
              <span>Robots.txt Enforced</span>
              <span>·</span>
              <span>Rate Limited</span>
              <span>·</span>
              <span>Zero Dummy Data Policy</span>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};
