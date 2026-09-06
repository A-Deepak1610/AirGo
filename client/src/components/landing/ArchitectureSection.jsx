import React from 'react';
import { 
  Globe, 
  Cpu, 
  Database, 
  Sliders, 
  TrendingUp, 
  Server, 
  Layout, 
  ArrowDown, 
  ArrowRight,
  Code2,
  CheckCircle
} from 'lucide-react';

export const ArchitectureSection = () => {
  const techStack = [
    { name: 'Python', role: 'Scraping & Econometric Core', badge: 'v3.11' },
    { name: 'Scrapy', role: 'High-Throughput Crawlers', badge: 'Async' },
    { name: 'Playwright', role: 'Headless Browser Automation', badge: 'Chromium' },
    { name: 'Selenium', role: 'Dynamic DOM Extraction', badge: 'Multi-Driver' },
    { name: 'PostgreSQL', role: 'Relational Fare & Index Store', badge: 'ACID' },
    { name: 'REST API', role: 'FastAPI Institutional Delivery', badge: '<35ms' },
    { name: 'React', role: 'Interactive Web Dashboard', badge: 'v19' },
    { name: 'Three.js', role: '3D Spatial Flight Radar', badge: 'WebGL' }
  ];

  const architectureLayers = [
    {
      level: 'LAYER 1',
      title: 'Target Ingestion Surfaces',
      items: ['Airline Carrier Web Portals (IndiGo, Air India, SpiceJet, Akasa)', 'OTA Aggregators (MakeMyTrip, Yatra, EaseMyTrip, Cleartrip, Ixigo)'],
      color: 'border-slate-300 bg-slate-50',
      icon: Globe
    },
    {
      level: 'LAYER 2',
      title: 'Scraping & Collection Layer',
      items: ['Async Playwright & Selenium Cluster', 'Dynamic CAPTCHA & JavaScript Rendering', 'IP Rotation & Session Isolation', 'Ethical Rate Limiting Safeguards'],
      color: 'border-blue-200 bg-blue-50/40',
      icon: Cpu
    },
    {
      level: 'LAYER 3',
      title: 'Raw Fare Storage & Verification',
      items: ['PostgreSQL & SQLite Canonical Store', 'Timestamped Run Folders (runs/YYYY-MM-DD...)', 'Rendered HTML Dumps & Screenshot Proofs'],
      color: 'border-indigo-200 bg-indigo-50/40',
      icon: Database
    },
    {
      level: 'LAYER 4',
      title: 'Cleaning & Normalization Engine',
      items: ['3σ Statistical Outlier Truncation', 'Sold-out & Cancelled Flight Detection', 'Decomposition: Base Fare + Taxes + UDF + Surcharges'],
      color: 'border-emerald-200 bg-emerald-50/40',
      icon: Sliders
    },
    {
      level: 'LAYER 5',
      title: 'Econometric Index Construction',
      items: ['DGCA Passenger Census Traffic Weighting', 'Laspeyres, Paasche, & Fisher Ideal Index Calculations', 'T+1 to T+45 Advance Booking Horizon Synthesis'],
      color: 'border-amber-200 bg-amber-50/40',
      icon: TrendingUp
    },
    {
      level: 'LAYER 6',
      title: 'API & Application Delivery Layer',
      items: ['FastAPI Institutional Feeds (NSO MoSPI CPI, RBI MPC Nowcasting)', 'React 19 + Tailwind CSS High-Frequency Analytics Dashboard', 'Three.js 3D National Airspace Corridor Radar'],
      color: 'border-slate-800 bg-slate-900 text-white',
      icon: Server
    }
  ];

  return (
    <section id="architecture" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>SYSTEM ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Built as an end-to-end data platform.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            A resilient multi-layered pipeline ensuring data provenance, cryptographic repeatability, and zero synthetic estimation at every stage.
          </p>
        </div>

        {/* Layered Flow Diagram */}
        <div className="mt-12 space-y-4 max-w-4xl mx-auto">
          {architectureLayers.map((layer, idx) => {
            const Icon = layer.icon;
            const isDark = layer.level === 'LAYER 6';
            return (
              <React.Fragment key={layer.level}>
                <div className={`p-5 rounded-2xl border ${layer.color} shadow-xs transition-all hover:shadow-md`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-current/10">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-blue-400 font-bold' : 'text-slate-500 font-semibold'}`}>
                          {layer.level}
                        </span>
                        <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {layer.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {layer.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {idx < architectureLayers.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Technology Labels Grid */}
        <div className="mt-16 pt-10 border-t border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-lg font-bold text-slate-900">
              Validated Production Technology Stack
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Engineered with modern, battle-tested open standards for automated reliability.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {techStack.map((tech) => (
              <div 
                key={tech.name} 
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center shadow-2xs hover:bg-white hover:border-blue-300 transition-all"
              >
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-600 font-semibold block w-fit mx-auto mb-1.5">
                  {tech.badge}
                </span>
                <div className="font-bold text-sm text-slate-900 font-mono">
                  {tech.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  {tech.role}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
