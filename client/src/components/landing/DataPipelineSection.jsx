import React from 'react';
import { 
  Globe, 
  Cpu, 
  Filter, 
  Sliders, 
  Scale, 
  TrendingUp, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export const DataPipelineSection = () => {
  const pipelineStages = [
    {
      step: '01',
      code: 'SOURCE',
      name: 'Airlines + OTAs',
      description: 'Continuous sampling across 5 scheduled airlines and 6 dominant online aggregators.',
      icon: Globe,
      metrics: '11 Platforms',
      badge: 'Multi-Source'
    },
    {
      step: '02',
      code: 'COLLECT',
      name: 'Collection Engine',
      description: 'Headless browser cluster executing JS rendering, anti-bot safeguards, and session routing.',
      icon: Cpu,
      metrics: '15m Intervals',
      badge: 'Ethical Scraper'
    },
    {
      step: '03',
      code: 'CLEAN',
      name: 'Cleaning & Deduplication',
      description: 'Outlier filtering (3σ), sold-out flight purging, and cryptographic payload deduplication.',
      icon: Filter,
      metrics: '99.98% Clean',
      badge: 'Sanitization'
    },
    {
      step: '04',
      code: 'NORMALIZE',
      name: 'Fare Normalization',
      description: 'Algorithmic separation of base fare, fuel surcharges, UDF, GST, and OTA gateway fees.',
      icon: Sliders,
      metrics: '4 Components',
      badge: 'Component Split'
    },
    {
      step: '05',
      code: 'WEIGHT',
      name: 'Route Weighting',
      description: 'Incorporates quarterly DGCA passenger census weights across 100 representative city-pairs.',
      icon: Scale,
      metrics: '82.4% Domestic Pax',
      badge: 'DGCA Census'
    },
    {
      step: '06',
      code: 'INDEX',
      name: 'Airfare Price Index',
      description: 'Computes Laspeyres, Paasche, and Fisher ideal price indexes at daily and weekly cadences.',
      icon: TrendingUp,
      metrics: 'APIx Base 100',
      badge: 'Fisher Formula'
    },
    {
      step: '07',
      code: 'ANALYZE',
      name: 'Analytics Dashboard',
      description: 'Serves MoSPI CPI transport feeds, RBI nowcasting metrics, and public interactive charts.',
      icon: BarChart3,
      metrics: '<35ms REST API',
      badge: 'Institutional Feeds'
    }
  ];

  return (
    <section id="pipeline" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>DATA ENGINEERING ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            From fare quote to national price signal.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Every fare is collected, disaggregated, weighted, and converted into a trusted macroeconomic metric through a rigorous seven-stage pipeline.
          </p>
        </div>

        {/* Pipeline Stage Cards (Horizontal Flow Grid) */}
        <div className="mt-14 relative">
          
          {/* Connecting Line behind cards on desktop */}
          <div className="hidden xl:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-300 via-indigo-300 to-emerald-300 -translate-y-1/2 z-0 opacity-60" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 relative z-10">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.code}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all hover:border-blue-400 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Step & Badge */}
                    <div className="flex items-center justify-between gap-1 mb-3">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {stage.step}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {stage.badge}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Stage Code & Name */}
                    <div className="font-mono text-[11px] font-semibold text-slate-400 tracking-wider">
                      {stage.code}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                      {stage.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs text-slate-600 font-normal leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  {/* Bottom Metric */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Target:</span>
                    <span className="font-bold text-slate-900">{stage.metrics}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Pipeline Guarantee Pill */}
        <div className="mt-10 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Zero Synthetic Fillers:</strong> If a scheduled flight is cancelled or rate-limited, the pipeline logs explicit telemetry rather than injecting fake prices.
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <span>Latency: <strong>15m sync</strong></span>
            <span>·</span>
            <span>UDF Cleared: <strong>100%</strong></span>
            <span>·</span>
            <span>Audit Trail: <strong>SHA-256 Verified</strong></span>
          </div>
        </div>

      </div>
    </section>
  );
};
