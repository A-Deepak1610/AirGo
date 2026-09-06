import React from 'react';
import { ShieldCheck, Scale, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MethodologySection = () => {
  const navigate = useNavigate();

  const principles = [
    {
      title: 'Representative Routes',
      subtitle: 'DGCA-Informed Route Selection',
      desc: 'Basket of domestic trunk, feeder, and regional corridors weighted strictly by DGCA annual passenger volume statistics. Captures 82.4% of total commercial domestic scheduled traffic.',
      standard: 'DGCA Annual Statistics 2024–2026',
      icon: Scale
    },
    {
      title: 'Advance Purchase Windows',
      subtitle: 'Standardized Lead-Time Horizons',
      desc: 'Uniform collection across T+1 (urgent), T+7 (weekly), T+15 (fortnightly), T+30 (monthly), and T+45 (baseline leisure) horizons, isolating pure inflation from time-decay pricing behavior.',
      standard: 'Temporal Price Stratification',
      icon: Calendar
    },
    {
      title: 'Fare Normalization',
      subtitle: 'Component-Level Disaggregation',
      desc: 'Explicit separation of core airline yield from statutory GST (5%), AERA regulatory User Development Fees (UDF), Passenger Service Fees (PSF), and non-statutory platform convenience fees.',
      standard: 'Base + Tax + UDF + Fee Decoupling',
      icon: CheckCircle2
    },
    {
      title: 'Econometric Back-Testing',
      subtitle: 'Historical Validation Against DGCA',
      desc: 'Back-tested against official DGCA monthly average-fare benchmarks and MoSPI CPI Transport Sub-Index. Confirms Mean Absolute Percentage Error (MAPE) of 2.14%, well within statistical tolerances.',
      standard: 'MAPE 2.14% · Correlation r = 0.942',
      icon: ShieldCheck
    }
  ];

  return (
    <section id="methodology" className="py-16 sm:py-20 bg-[#090D18] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Statistical Governance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans">
              Built for Transparent Price Measurement
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              AirGo adheres to international price statistics standards, ensuring reproducible, auditable, and unmanipulated market measurement.
            </p>
          </div>

          <button
            onClick={() => navigate('/backtesting')}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <span>View Back-Testing Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Technical Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-[#0B1120] border border-slate-800/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      PILLAR 0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">
                      {p.title}
                    </h3>
                    <p className="text-xs font-mono text-cyan-400 font-semibold mt-0.5">
                      {p.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Benchmark Reference:</span>
                  <span className="font-bold text-slate-200">{p.standard}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
