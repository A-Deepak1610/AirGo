import React from 'react';
import { motion } from 'framer-motion';

export const PlatformPhilosophy = () => {
  const pillars = [
    {
      num: '01',
      verb: 'CAPTURE',
      claim: 'See what travellers actually see.',
      narrative: 'Not theoretical scheduled tariffs, but real-time quotes returned at checkout across airline booking engines and OTAs.'
    },
    {
      num: '02',
      verb: 'NORMALIZE',
      claim: 'Turn fragmented fare quotes into comparable data.',
      narrative: 'Disaggregating fuel surcharges, user development fees, convenience charges, and baggage addons into standardized base economic components.'
    },
    {
      num: '03',
      verb: 'UNDERSTAND',
      claim: 'Turn millions of observations into a meaningful price signal.',
      narrative: 'Synthesizing Laspeyres, Paasche, and Fisher ideal price indexes weighted by actual DGCA quarterly passenger movement census data.'
    }
  ];

  return (
    <section id="philosophy" className="py-28 sm:py-36 bg-white border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">
        
        {/* Section Intro Label */}
        <div className="text-center">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
            PLATFORM PHILOSOPHY
          </span>
        </div>

        {/* 3 Grand Typographic Statements */}
        {pillars.map((p) => (
          <div 
            key={p.verb}
            className="border-t border-slate-200 pt-12 flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-12"
          >
            {/* Step Number & Grand Verb */}
            <div className="flex items-baseline gap-4 min-w-[260px] lg:w-[320px] shrink-0">
              <span className="font-mono text-base font-bold text-blue-600">
                {p.num}
              </span>
              <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
                {p.verb}
              </h3>
            </div>

            {/* Headline Claim & Narrative */}
            <div className="space-y-3 max-w-2xl flex-1">
              <h4 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight leading-snug">
                {p.claim}
              </h4>
              <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed">
                {p.narrative}
              </p>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
};
