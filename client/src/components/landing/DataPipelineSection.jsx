import React from 'react';
import { 
  Database, 
  Filter, 
  Layers, 
  Cpu, 
  TrendingUp, 
  LayoutDashboard, 
  Server,
  FileCheck2
} from 'lucide-react';

export const DataPipelineSection = () => {
  const nodes = [
    {
      id: '01',
      title: 'AIRLINES + OTAs',
      subtitle: 'Primary Ingestion Sources',
      desc: 'IndiGo TLS, Air India, SpiceJet, Akasa Direct + EaseMyTrip, MakeMyTrip, Ixigo, Cleartrip',
      metric: '8 Scraping Engines · TLS Fingerprinting',
      icon: Server,
      color: 'border-blue-500/50 text-blue-400 bg-blue-500/10'
    },
    {
      id: '02',
      title: 'DATA COLLECTION',
      subtitle: 'Headless Playwright Pipeline',
      desc: 'Synchronized job daemons polling 80+ route pairs across T+1, T+7, T+15, T+30, T+45 lead horizons',
      metric: 'Every 15m · 4,720 quotes/batch',
      icon: Database,
      color: 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10'
    },
    {
      id: '03',
      title: 'RAW FARES',
      subtitle: 'HTML/DOM Extraction Audit',
      desc: 'Immutable raw JSON observations persisted into timestamped audit runs with rendered DOM proof',
      metric: 'Zero-Dummy Data · Evidence Vault',
      icon: FileCheck2,
      color: 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10'
    },
    {
      id: '04',
      title: 'CLEANING',
      subtitle: 'Outlier & Anomaly Filtration',
      desc: 'Tukey 1.5× Interquartile Range (IQR) fence, canonical flight deduplication, sold-out seat removal',
      metric: '99.1% Yield · 35 Outliers Rejected',
      icon: Filter,
      color: 'border-purple-500/50 text-purple-400 bg-purple-500/10'
    },
    {
      id: '05',
      title: 'NORMALIZATION',
      subtitle: 'Component-Level Disaggregation',
      desc: 'Rigorous 4-part tariff separation: Base Commercial Fare, Statutory GST (5%), AERA UDF/PSF, Convenience Fees',
      metric: 'Mandatory vs Ancillary Decoupling',
      icon: Layers,
      color: 'border-amber-500/50 text-amber-400 bg-amber-500/10'
    },
    {
      id: '06',
      title: 'INDEX ENGINE',
      subtitle: 'Econometric Weighting Calculator',
      desc: 'Laspeyres base weights ($L_t$), Jevons geometric mean ($J_t$), and Fisher superlative ($F_t$) formulas',
      metric: 'Base 2024 = 100.0 · DGCA Pax Basket',
      icon: Cpu,
      color: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
    },
    {
      id: '07',
      title: 'APIx REAL-TIME',
      subtitle: 'National Airfare Price Index',
      desc: 'Multi-horizon daily, weekly, and monthly index tracking with corridor pressure indicators',
      metric: '118.40 Real-time Series',
      icon: TrendingUp,
      color: 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10'
    },
    {
      id: '08',
      title: 'DASHBOARD & REST API',
      subtitle: 'Institutional Downstream Distribution',
      desc: 'FastAPI /api/v1 gateway, MoSPI/DGCA reporting feeds, and policy analyst briefing portal',
      metric: '42ms Latency · 99.98% Gateway Uptime',
      icon: LayoutDashboard,
      color: 'border-blue-500/50 text-blue-400 bg-blue-500/10'
    }
  ];

  return (
    <section id="pipeline" className="py-16 sm:py-20 bg-[#090D18] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
            <span>Production Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans">
            End-to-End Data Pipeline Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            From automated headless TLS scraping to disaggregated component analysis and ISO-compliant econometric index calculation.
          </p>
        </div>

        {/* Technical Pipeline Grid with Connecting Flow Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {nodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                className="bg-[#0B1120] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl border ${node.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      STEP {node.id}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                      {node.title}
                    </h3>
                    <p className="text-[11px] font-mono text-cyan-300 font-semibold mt-0.5">
                      {node.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {node.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Audit Guarantee:</span>
                  <span className="font-bold text-slate-200">{node.metric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
