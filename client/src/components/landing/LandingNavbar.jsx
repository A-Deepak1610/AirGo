import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowRight } from 'lucide-react';

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
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-blue-600 transition-colors">
            <Plane className="w-4 h-4 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-[15px] tracking-tight whitespace-nowrap">
                Airfare Intelligence Platform
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                APIx INDIA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal leading-none mt-0.5 whitespace-nowrap">
              National Airfare Price Index Infrastructure
            </p>
          </div>
        </div>

        {/* Narrative Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-slate-600">
          <a href="#story" className="hover:text-slate-900 transition-colors">Story</a>
          <a href="#gap" className="hover:text-slate-900 transition-colors">The Gap</a>
          <a href="#signal" className="hover:text-slate-900 transition-colors">Noise to Signal</a>
          <a href="#philosophy" className="hover:text-slate-900 transition-colors">Philosophy</a>
          <a href="#index-concept" className="hover:text-slate-900 transition-colors">Price Index</a>
          <a href="#human" className="hover:text-slate-900 transition-colors">Human Factor</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Directory</a>
        </nav>

        {/* Action CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <span>Explore Platform</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </header>
  );
};
