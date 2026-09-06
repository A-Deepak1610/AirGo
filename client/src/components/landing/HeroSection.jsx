import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Activity, Plane, ShieldCheck, Database, Layers } from 'lucide-react';
import { IndiaAviation3DMap } from '../network/IndiaAviation3DMap';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-10 pb-16 lg:py-20">
      {/* Subtle Background Graticule Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Core Positioning Copy & CTAs (5 Cols on large screens) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>REAL-TIME AIRFARE INTELLIGENCE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
              India's Airfares Are Dynamic.{' '}
              <span className="text-blue-600 block mt-1">Our Data Shouldn't Be.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-xl">
              Automatically collect, normalize and analyze airline and OTA fares to build a high-frequency Airfare Price Index that reflects what Indian travellers actually pay.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/index-apix')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>Explore the Index</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#architecture"
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base transition-colors shadow-2xs"
              >
                <span>View Architecture</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Trust Statement */}
            <div className="pt-4 border-t border-slate-200/80">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Airlines • OTAs • DGCA Data • Real-time Analytics
              </p>
              <div className="mt-2.5 flex items-center gap-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>DGCA Weight Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>100+ City-Pair Census</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>15m Intraday Sampling</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D India Aviation Network & Floating Telemetry Overlay (6 Cols) */}
          <div className="lg:col-span-6 relative">
            
            {/* Ambient subtle glow under 3D map */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 rounded-3xl blur-2xl -z-10" />

            {/* 3D Map Container Card */}
            <div className="relative rounded-2xl border border-slate-800 shadow-xl overflow-hidden bg-[#0a0f1d]">
              <IndiaAviation3DMap 
                defaultRoute="DEL-BOM"
                height="480px"
                isHeroMode={true}
                showControls={false}
              />
            </div>

            {/* Floating Data Overlay Card 1: Airfare Index */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="absolute -top-4 -left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3.5 shadow-lg max-w-[200px]"
            >
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                AIRFARE INDEX
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  128.6
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  ↑ 4.2%
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                this week · Base 2024=100
              </div>
            </motion.div>

            {/* Floating Data Overlay Card 2: DEL -> BOM Corridor */}
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="absolute top-1/2 -right-4 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3.5 shadow-lg max-w-[190px]"
            >
              <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-500">
                <span className="font-mono text-blue-600 font-bold">DEL → BOM</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-50 text-red-700 font-mono font-bold">
                  +12.4%
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                ₹6,842
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Avg Trunk Fare (T+15)
              </div>
            </motion.div>

            {/* Floating Data Overlay Card 3: Active Routes */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="absolute -bottom-4 left-8 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  ACTIVE ROUTES
                </div>
                <div className="text-base font-bold font-mono text-slate-900 leading-none mt-0.5">
                  42 Trunk & Secondary
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};
