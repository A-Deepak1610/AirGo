import React from 'react';
import { User, Building, Plane, CalendarCheck, CreditCard } from 'lucide-react';

export const HumanJourneySection = () => {
  const vignettes = [
    {
      label: 'The Traveller',
      narrative: 'A family visiting loved ones, a patient attending an urgent medical appointment, a business professional closing an enterprise deal.',
      icon: User
    },
    {
      label: 'The Airport',
      narrative: '20 major civil aviation hubs processing over 150 million passengers annually across regional and metropolitan terminals.',
      icon: Building
    },
    {
      label: 'The Aircraft',
      narrative: 'Scheduled daily flights balancing operational fuel burns, turnaround slots, and load factor optimization.',
      icon: Plane
    },
    {
      label: 'The Booking',
      narrative: 'The moment of decision at point-of-sale—navigating dynamic surges, convenience charges, and baggage addons.',
      icon: CalendarCheck
    },
    {
      label: 'The Fare',
      narrative: 'The final economic transaction that determines real consumer purchasing power and transportation inflation.',
      icon: CreditCard
    }
  ];

  return (
    <section id="human" className="py-24 sm:py-32 bg-white border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 mb-3 block">
            HUMAN PERSPECTIVE
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Because behind every data point is a journey.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Macroeconomic indices are valuable only when they capture the authentic lived reality of citizens navigating the modern transport economy.
          </p>
        </div>

        {/* 5 Minimalist Vignettes (Horizontal Row) */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {vignettes.map((v) => {
            const Icon = v.icon;
            return (
              <div 
                key={v.label}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 mb-5 shadow-2xs">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {v.label}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                    {v.narrative}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
