import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const FeatureNavigation = () => {
  const navigate = useNavigate();

  const features = [
    {
      num: '01',
      title: 'Airfare Index',
      desc: 'Measure movement.',
      detail: 'Laspeyres, Paasche, and Fisher ideal index calculations across daily and weekly frequencies.',
      path: '/index-apix'
    },
    {
      num: '02',
      title: 'Route Intelligence',
      desc: 'Understand individual sectors.',
      detail: 'Corridor-level price dispersion, traffic weights, and dynamic yield pressure gauges.',
      path: '/analytics'
    },
    {
      num: '03',
      title: 'Data Explorer',
      desc: 'Explore collected fare observations.',
      detail: 'Audit granular scraped fares, base fare splits, taxes, and convenience surcharges.',
      path: '/airfare-data'
    },
    {
      num: '04',
      title: 'Analytics',
      desc: 'Find patterns across the market.',
      detail: 'Econometric lead-time curves from T+1 to T+45 and carrier elasticity comparisons.',
      path: '/analytics'
    },
    {
      num: '05',
      title: 'API & Infrastructure',
      desc: 'Make the data accessible.',
      detail: 'Institutional feeds for MoSPI CPI transport indices, RBI nowcasting, and crawler health.',
      path: '/system-status'
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-white border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 mb-2 block">
            DESTINATION DIRECTORY
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Explore the intelligence layer.
          </h2>
          <p className="mt-3 text-base text-slate-600 font-normal">
            Step directly into the specialized functional modules of the operational platform.
          </p>
        </div>

        {/* Large Editorial Links List */}
        <div className="divide-y divide-slate-200">
          {features.map((f) => (
            <div
              key={f.num}
              onClick={() => navigate(f.path)}
              className="py-8 sm:py-10 flex flex-col md:flex-row md:items-baseline justify-between gap-4 cursor-pointer group hover:bg-slate-50/70 px-4 -mx-4 rounded-2xl transition-all"
            >
              <div className="flex items-baseline gap-6">
                <span className="font-mono text-sm sm:text-base font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  {f.num}
                </span>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span>{f.title}</span>
                    <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 mt-1">
                    {f.desc}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 max-w-md md:text-right font-normal">
                {f.detail}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
