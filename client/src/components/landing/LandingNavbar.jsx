import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Menu, X } from 'lucide-react';

export const LandingNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080C14]/90 backdrop-blur-md border-b border-slate-800/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.25)]">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white font-sans">
                Air<span className="text-cyan-400">Go</span>
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                SIH26056
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <button 
            onClick={() => scrollToSection('platform')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Platform
          </button>
          <button 
            onClick={() => scrollToSection('index')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Airfare Index
          </button>
          <button 
            onClick={() => scrollToSection('network')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Network
          </button>
          <button 
            onClick={() => scrollToSection('pipeline')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Data Pipeline
          </button>
          <button 
            onClick={() => scrollToSection('methodology')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Methodology
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer shadow-xs"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/index-apix')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-950 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <span>Explore Airfare Index</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white border border-slate-800"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0F1D] border-b border-slate-800 px-4 py-3 space-y-2 text-xs font-medium text-slate-300">
          <button 
            onClick={() => scrollToSection('platform')}
            className="block w-full text-left py-1.5 hover:text-cyan-400"
          >
            Platform
          </button>
          <button 
            onClick={() => scrollToSection('index')}
            className="block w-full text-left py-1.5 hover:text-cyan-400"
          >
            Airfare Index
          </button>
          <button 
            onClick={() => scrollToSection('network')}
            className="block w-full text-left py-1.5 hover:text-cyan-400"
          >
            Network Map
          </button>
          <button 
            onClick={() => scrollToSection('pipeline')}
            className="block w-full text-left py-1.5 hover:text-cyan-400"
          >
            Data Pipeline
          </button>
          <button 
            onClick={() => scrollToSection('methodology')}
            className="block w-full text-left py-1.5 hover:text-cyan-400"
          >
            Methodology
          </button>
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-1.5 rounded-lg text-center bg-slate-900 border border-slate-700 text-white font-semibold"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/index-apix')}
              className="flex-1 py-1.5 rounded-lg text-center bg-cyan-400 text-slate-950 font-bold"
            >
              Explore Index
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
