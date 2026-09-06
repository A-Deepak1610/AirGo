import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Clock, TrendingUp } from 'lucide-react';

export const LandingStory = () => {
  const [activeStep, setActiveStep] = useState(2); // default T+15

  const stages = [
    {
      window: 'T+45',
      multiplier: '1.0x Base',
      heading: 'A traveller books early.',
      detail: 'Airlines release base inventory tranches. Prices sit at leisure equilibrium, reflecting predictable scheduled capacity before algorithmic demand pressures emerge.',
      indicative: 'Baseline Economic Anchor'
    },
    {
      window: 'T+30',
      multiplier: '1.18x Index',
      heading: 'Demand begins changing.',
      detail: 'Corporate travel policies activate. Seat buckets adjust quietly as passenger booking velocities outpace seasonal baselines on high-density corridors.',
      indicative: 'First Inventory Shift'
    },
    {
      window: 'T+15',
      multiplier: '1.45x Surge',
      heading: 'Prices start responding.',
      detail: 'Yield optimization algorithms evaluate remaining aircraft seat capacity. Discount fares disappear, and fare spreads between morning and afternoon departures widen.',
      indicative: 'Dynamic Yield Activation'
    },
    {
      window: 'T+7',
      multiplier: '1.92x Inelastic',
      heading: 'The market tightens.',
      detail: 'Price elasticity collapses. Travellers with inflexible business commitments are forced into higher yield tiers regardless of base operating costs.',
      indicative: 'Inelastic Surge Window'
    },
    {
      window: 'T+1',
      multiplier: '2.50x Spot',
      heading: 'The price may look completely different.',
      detail: 'The final available seats are repriced continuously up to departure time. The exact same seat can cost 2.5x more than it did six weeks prior.',
      indicative: 'Terminal Spot Pricing'
    }
  ];

  return (
    <section id="story" className="py-24 sm:py-32 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-600">
            THE ANATOMY OF ADVANCE PURCHASE
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Every fare tells a story.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Domestic airline pricing in India is not a static number—it is a continuous, time-decaying probability distribution.
          </p>
        </div>

        {/* Narrative Progression Timeline */}
        <div className="mt-20 relative">
          
          {/* Vertical Guide Line */}
          <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />

          <div className="space-y-12 sm:space-y-16">
            {stages.map((stg, idx) => {
              const isEven = idx % 2 === 0;
              const isActive = activeStep === idx;

              return (
                <div 
                  key={stg.window}
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`relative flex flex-col sm:flex-row items-start gap-8 sm:gap-16 group cursor-pointer ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Central Timeline Window Node */}
                  <div className={`absolute left-8 sm:left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl border-2 shadow-md flex flex-col items-center justify-center transition-all z-10 ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white shadow-blue-500/20 shadow-lg scale-105'
                      : 'border-slate-900 bg-white text-slate-900 group-hover:border-blue-600 group-hover:text-blue-600'
                  }`}>
                    <span className="font-mono font-black text-sm">{stg.window}</span>
                    <span className={`text-[9px] font-mono ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {stg.multiplier.split(' ')[0]}
                    </span>
                  </div>

                  {/* Content Card (Half Width) */}
                  <div className={`pl-20 sm:pl-0 sm:w-1/2 ${isEven ? 'sm:text-right' : 'sm:text-left'}`}>
                    <div className={`inline-block p-6 sm:p-8 rounded-3xl bg-white border transition-all ${
                      isActive 
                        ? 'border-blue-500/50 shadow-md ring-2 ring-blue-500/10' 
                        : 'border-slate-200 shadow-xs hover:shadow-sm'
                    }`}>
                      <div className={`flex items-center gap-2 mb-1.5 ${isEven ? 'sm:justify-end' : 'sm:justify-start'}`}>
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-600">
                          {stg.indicative}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {stg.multiplier}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                        {stg.heading}
                      </h3>
                      <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                        {stg.detail}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for other half */}
                  <div className="hidden sm:block sm:w-1/2" />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
