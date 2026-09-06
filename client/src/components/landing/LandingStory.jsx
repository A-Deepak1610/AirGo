import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Clock } from 'lucide-react';

export const LandingStory = () => {
  const [activeStep, setActiveStep] = useState(0);

  const stages = [
    {
      window: 'T+45',
      heading: 'A traveller books early.',
      detail: 'Airlines release base inventory tranches. Prices sit at leisure equilibrium, reflecting predictable scheduled capacity before algorithmic demand pressures emerge.',
      indicative: 'Baseline Economic Anchor'
    },
    {
      window: 'T+30',
      heading: 'Demand begins changing.',
      detail: 'Corporate travel policies activate. Seat buckets adjust quietly as passenger booking velocities outpace seasonal baselines on high-density corridors.',
      indicative: 'First Inventory Shift'
    },
    {
      window: 'T+15',
      heading: 'Prices start responding.',
      detail: 'Yield optimization algorithms evaluate remaining aircraft seat capacity. Discount fares disappear, and fare spreads between morning and afternoon departures widen.',
      indicative: 'Dynamic Yield Activation'
    },
    {
      window: 'T+7',
      heading: 'The market tightens.',
      detail: 'Price elasticity collapses. Travellers with inflexible business commitments are forced into higher yield tiers regardless of base operating costs.',
      indicative: 'Inelastic Surge Window'
    },
    {
      window: 'T+1',
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
              return (
                <div 
                  key={stg.window}
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`relative flex flex-col sm:flex-row items-start gap-8 sm:gap-16 group ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Central Timeline Window Node */}
                  <div className="absolute left-8 sm:left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-white border-2 border-slate-900 shadow-md flex items-center justify-center font-mono font-black text-sm text-slate-900 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all z-10">
                    {stg.window}
                  </div>

                  {/* Content Card (Half Width) */}
                  <div className={`pl-20 sm:pl-0 sm:w-1/2 ${isEven ? 'sm:text-right' : 'sm:text-left'}`}>
                    <div className="inline-block p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-600 block mb-1">
                        {stg.indicative}
                      </span>
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
