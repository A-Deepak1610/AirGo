import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Compass, Shield } from 'lucide-react';
import { IndiaFlightScene } from './IndiaFlightScene';

export const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center bg-white border-b border-slate-200/80 overflow-hidden pt-8 pb-16">
      {/* Subtle Background Radial Graticule */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Editorial Typography & CTAs (5-6 Cols) */}
          <div className="lg:col-span-5 space-y-7">
            
            {/* Small Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>AIRFARE INTELLIGENCE FOR INDIA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              The Price of a Flight Changes.{' '}
              <span className="text-blue-600 block mt-2">The Signal Shouldn't.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-lg">
              A high-frequency airfare intelligence platform designed to capture the prices Indian travellers actually see — across routes, airlines, booking windows and time.
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2.5 px-7 py-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <a
                href="#story"
                className="flex items-center gap-2 px-6 py-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base transition-colors shadow-2xs"
              >
                <span>How It Works</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Editorial Footer Tagline */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500 font-mono">
              <span>Directorate General of Civil Aviation Data</span>
              <span>·</span>
              <span>Real-Time Web Scrapes</span>
            </div>

          </div>

          {/* Right Side: Exclusive 3D India Aviation Visualization (7 Cols) */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl bg-[#0a0f1d] border border-slate-800 shadow-2xl overflow-hidden">
              <IndiaFlightScene />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
