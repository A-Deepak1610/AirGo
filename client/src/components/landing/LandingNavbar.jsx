import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowRight, ShieldCheck, BarChart3, Database, Layers, ExternalLink } from 'lucide-react';

export const LandingNavbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs' 
        : 'bg-white border-b border-slate-200/60'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-blue-600 transition-colors">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-[15px] tracking-tight whitespace-nowrap">
                Airfare Intelligence Platform
              </span>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                APIx INDIA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal leading-none mt-0.5 whitespace-nowrap">
              National Airfare Price Index Infrastructure
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-[13px] font-medium text-slate-600">
          <a href="#problem" className="hover:text-slate-900 transition-colors">Problem</a>
          <a href="#dynamic-pricing" className="hover:text-slate-900 transition-colors">Dynamic Pricing</a>
          <a href="#pipeline" className="hover:text-slate-900 transition-colors">Pipeline</a>
          <a href="#sources" className="hover:text-slate-900 transition-colors">Data Sources</a>
          <a href="#network" className="hover:text-slate-900 transition-colors">3D Network</a>
          <a href="#index" className="hover:text-slate-900 transition-colors">Price Index</a>
          <a href="#heatmap" className="hover:text-slate-900 transition-colors">Heatmap</a>
          <a href="#architecture" className="hover:text-slate-900 transition-colors">Architecture</a>
          <a href="#backtest" className="hover:text-slate-900 transition-colors">Backtesting</a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/index-apix')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Methodology</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <span>Open Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
