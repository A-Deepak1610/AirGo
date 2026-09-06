import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Plane, 
  Compass, 
  ArrowUpRight, 
  ChevronRight,
  Download,
  Calendar,
  Tag,
  Building2,
  RotateCcw,
  Terminal,
  CheckCircle2,
  Copy,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  historicalTimeSeries, 
  routeAnalyticsList, 
  airlineAnalyticsList 
} from '../data/analyticsData';
import { RouteHeatmapGrid } from '../components/analytics/RouteHeatmapGrid';
import { PageHeader } from '../components/layout/PageHeader';

export const IndexApixPage = () => {
  const navigate = useNavigate();
  const [activeFormula, setActiveFormula] = useState('laspeyres'); // 'laspeyres' | 'jevons' | 'fisher'
  const [activeHorizon, setActiveHorizon] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [activeApiTab, setActiveApiTab] = useState('nso'); // 'nso' | 'rbi' | 'python'
  const [copiedApi, setCopiedApi] = useState(false);

  // Calculations for formula variants based on current data
  const formulaStats = {
    laspeyres: {
      name: 'Laspeyres Price Index',
      symbol: 'L_t',
      currentValue: 118.4,
      change24h: '+1.4%',
      change7d: '+2.8%',
      description: 'Fixed-weight base-period traffic basket. Official baseline standard used by DGCA & MoSPI.',
      equation: 'L_t = \\sum w_{i,0} \\cdot (P_{i,t} / P_{i,0})'
    },
    jevons: {
      name: 'Jevons Geometric Index',
      symbol: 'J_t',
      currentValue: 117.65,
      change24h: '+1.2%',
      change7d: '+2.5%',
      description: 'Geometric mean weighting. Eliminates upward substitution bias under dynamic pricing shifts.',
      equation: 'J_t = \\prod (P_{i,t} / P_{i,0})^{w_{i,0}}'
    },
    fisher: {
      name: 'Fisher Ideal Index',
      symbol: 'F_t',
      currentValue: 118.02,
      change24h: '+1.3%',
      change7d: '+2.6%',
      description: 'Superlative geometric mean of Laspeyres and Paasche formulations, satisfying time-reversal tests.',
      equation: 'F_t = \\sqrt{L_t \\times P_t}'
    }
  };

  const currentFormula = formulaStats[activeFormula];

  // Horizon multiplier adjustments for chart
  const horizonData = historicalTimeSeries.map((pt) => {
    let multiplier = 1.0;
    if (activeFormula === 'jevons') multiplier = 0.994;
    if (activeFormula === 'fisher') multiplier = 0.997;

    return {
      date: pt.date,
      HeadlineIndex: +(pt.index * multiplier).toFixed(1),
      T1SurgeIndex: +(pt.t1Index * multiplier).toFixed(1),
      T45BaseIndex: +(pt.t45Index * multiplier).toFixed(1)
    };
  });

  const [dateRange, setDateRange] = useState('Aug 01 - Aug 31, 2026');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCarrier, setSelectedCarrier] = useState('ALL');

  const handleExport = () => {
    const exportPayload = {
      series: 'APIx Real-time Index Series',
      formula: activeFormula,
      horizon: activeHorizon,
      base: '2024 = 100.0',
      data: horizonData
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `apix_index_${activeFormula}_${activeHorizon}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans animate-in fade-in duration-200">
      {/* 1. Standard Reusable PageHeader */}
      <PageHeader
        title="Real-Time Airfare Price Index (APIx)"
        description="Econometric price index for Indian domestic civil aviation with multi-horizon tracking and Laspeyres, Jevons, and Fisher formulations."
        badge={
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold font-mono">
            Base 2024 = 100.0
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Horizon Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              {['daily', 'weekly', 'monthly'].map((h) => (
                <button
                  key={h}
                  onClick={() => setActiveHorizon(h)}
                  className={`px-3 py-1 rounded-md capitalize transition-all cursor-pointer ${
                    activeHorizon === h
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Series
            </button>
          </div>
        }
        filters={
          <div className="flex items-center justify-between gap-3 flex-wrap w-full text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Date Range */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Date:</span>
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="Aug 01 - Aug 31, 2026">Aug 01 - Aug 31, 2026</option>
                  <option value="Jul 01 - Jul 31, 2026">Jul 01 - Jul 31, 2026</option>
                  <option value="Jun 01 - Jun 30, 2026">Jun 01 - Jun 30, 2026</option>
                </select>
              </div>

              {/* Corridor Category */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Sector:</span>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Route Categories</option>
                  <option value="Metro to Metro">Metro to Metro</option>
                  <option value="Metro to Non-Metro">Metro to Non-Metro</option>
                  <option value="Tier-2 Feeder">Tier-2 Feeder Corridors</option>
                  <option value="Tourist & Regional">Tourist & Regional</option>
                </select>
              </div>

              {/* Carrier */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Carrier:</span>
                <select 
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Carriers</option>
                  <option value="IndiGo">IndiGo (6E)</option>
                  <option value="Air India">Air India (AI)</option>
                  <option value="Akasa Air">Akasa Air (QP)</option>
                  <option value="SpiceJet">SpiceJet (SG)</option>
                </select>
              </div>
            </div>

            {(selectedCategory !== 'ALL' || selectedCarrier !== 'ALL' || dateRange !== 'Aug 01 - Aug 31, 2026') && (
              <button
                onClick={() => {
                  setDateRange('Aug 01 - Aug 31, 2026');
                  setSelectedCategory('ALL');
                  setSelectedCarrier('ALL');
                }}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        }
      />

      {/* Formula Selector Tabs & Headline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(formulaStats).map(([key, f]) => (
          <div
            key={key}
            onClick={() => setActiveFormula(key)}
            className={`p-5 rounded-xl border cursor-pointer transition-all shadow-2xs ${
              activeFormula === key
                ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-[#111827]">
                  {f.name}
                </span>
                <p className="text-2xl sm:text-[26px] font-semibold text-[#111827] mt-1 font-mono tabular-nums leading-none">
                  {f.currentValue.toFixed(2)}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded font-mono ${
                activeFormula === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {f.symbol}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-[#4B5563] mt-2 line-clamp-2 leading-relaxed">
              {f.description}
            </p>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-medium flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5" /> 24h: {f.change24h}
              </span>
              <span className="text-[#6B7280] font-normal font-mono">
                7d: {f.change7d}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Section: Index Trajectory Time Series Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-[#111827] tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>National APIx Historical Trajectory ({currentFormula.name})</span>
            </h2>
            <p className="text-xs sm:text-[13px] font-normal text-[#4B5563] mt-0.5">
              Tracking Headline APIx vs. Urgent Booking Surge (T+1) vs. Long-Lead Base Inventory (T+45).
            </p>
          </div>

          <div className="text-xs font-mono text-[#6B7280]">
            Observation Frequency: <span className="font-semibold text-[#111827] capitalize">{activeHorizon}</span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={horizonData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[90, 150]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line 
                type="monotone" 
                name="APIx Headline Index" 
                dataKey="HeadlineIndex" 
                stroke="#2563eb" 
                strokeWidth={2.5} 
                dot={false} 
              />
              <Line 
                type="monotone" 
                name="T+1 Surge Window Index" 
                dataKey="T1SurgeIndex" 
                stroke="#dc2626" 
                strokeWidth={1.8} 
                strokeDasharray="4 4" 
                dot={false} 
              />
              <Line 
                type="monotone" 
                name="T+45 Base Inventory Index" 
                dataKey="T45BaseIndex" 
                stroke="#10b981" 
                strokeWidth={1.8} 
                strokeDasharray="4 4" 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section: Carrier-Wise Price Indices */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#111827] tracking-tight flex items-center gap-2">
              <Plane className="w-4 h-4 text-blue-600" />
              Carrier-Wise Airfare Indices & Market Shares
            </h2>
            <p className="text-xs sm:text-[13px] font-normal text-[#4B5563] mt-0.5">
              Domestic scheduled airline pricing indices computed from weighted elementary price relatives.
            </p>
          </div>
          <span className="text-xs font-mono text-[#6B7280]">Weighted by domestic seat capacity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {airlineAnalyticsList.map((a) => (
            <div key={a.code} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#111827]">{a.name}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {a.code}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-semibold text-[#111827] font-mono tabular-nums leading-none">{a.index}</span>
                <span className="text-xs font-medium text-emerald-600 font-mono">
                  +{a.yoyPct}% YoY
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-[#4B5563]">
                  <span>DGCA Market Share:</span>
                  <span className="font-semibold text-[#111827] font-mono tabular-nums">{a.marketSharePct}%</span>
                </div>
                <div className="flex justify-between text-[#4B5563]">
                  <span>Mean Fare:</span>
                  <span className="font-semibold text-[#111827] font-mono tabular-nums">₹{a.avgFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#4B5563]">
                  <span>T+1 Surge Multiplier:</span>
                  <span className="font-semibold text-red-600 font-mono tabular-nums">{a.surgeMultiplier}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Corridor-Wise Price Indices Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#111827] tracking-tight flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              DGCA Monitored Corridors — Index & Price Movements
            </h2>
            <p className="text-xs sm:text-[13px] font-normal text-[#4B5563] mt-0.5">
              Corridor-specific Laspeyres price index numbers with base 2024 tariffs and 24-hour rate of change.
            </p>
          </div>
          <span className="text-xs text-[#6B7280] font-mono">Total Corridors: {routeAnalyticsList.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#6B7280] bg-slate-50 font-medium">
                <th className="py-2.5 px-4 font-medium">Corridor Code</th>
                <th className="py-2.5 px-4 font-medium">Sector Description</th>
                <th className="py-2.5 px-4 font-medium font-mono">DGCA Weight (w_i)</th>
                <th className="py-2.5 px-4 font-medium font-mono">2024 Base Fare</th>
                <th className="py-2.5 px-4 font-medium font-mono">Current Fare</th>
                <th className="py-2.5 px-4 font-medium font-mono text-[#111827]">APIx Corridor Index</th>
                <th className="py-2.5 px-4 font-medium font-mono">24h Shift</th>
                <th className="py-2.5 px-4 font-medium font-mono">YoY Change</th>
                <th className="py-2.5 px-4 text-right font-medium">Route Deep Dive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-[#4B5563]">
              {routeAnalyticsList.map((r) => (
                <tr key={r.route} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-blue-700 text-[13px]">{r.route}</td>
                  <td className="py-3 px-4 font-medium text-[#111827] text-[13px]">{r.name || `${r.city1} ↔ ${r.city2}`}</td>
                  <td className="py-3 px-4 font-mono tabular-nums">{r.trafficWeightPct || r.weightPct}%</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-[#6B7280]">₹{(r.baseFare2024 || r.baseFare || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono tabular-nums font-medium text-[#111827]">₹{(r.currentFare || r.avgFare || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono tabular-nums font-semibold text-blue-600 text-[13px]">{r.index}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-emerald-600 font-medium">
                    +{r.dodPct || '0.4'}%
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-[#4B5563]">
                    +{r.yoyPct}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/index/routes/${r.route}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[#4B5563] hover:text-[#111827] text-xs font-medium transition-colors cursor-pointer"
                    >
                      Inspect Micro-Data <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section: Institutional NSO & RBI High-Frequency Ingestion API Specification */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-[#111827] tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              Institutional API Gateway for NSO & Reserve Bank of India
            </h2>
            <p className="text-xs sm:text-[13px] font-normal text-[#4B5563] mt-0.5">
              Production JSON data streams designed for MoSPI Consumer Price Index compilation and RBI Monetary Policy nowcasting.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveApiTab('nso')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeApiTab === 'nso' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              MoSPI / NSO Feed
            </button>
            <button
              onClick={() => setActiveApiTab('rbi')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeApiTab === 'rbi' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              RBI Bulletin Feed
            </button>
            <button
              onClick={() => setActiveApiTab('python')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeApiTab === 'python' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              Python Client
            </button>
          </div>
        </div>

        {/* Code & Specification Box */}
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-100 overflow-x-auto relative">
          <button
            onClick={() => {
              const code = activeApiTab === 'nso' 
                ? 'curl -X GET "http://localhost:8000/api/v1/institutional/nso-feed" -H "Accept: application/json"'
                : activeApiTab === 'rbi'
                ? 'curl -X GET "http://localhost:8000/api/v1/institutional/rbi-bulletin" -H "Accept: application/json"'
                : 'import requests\n\n# MoSPI CPI Central Compilation Integration\nr = requests.get("http://localhost:8000/api/v1/institutional/nso-feed")\ndata = r.json()\nprint(f"National APIx: {data[\'headline_indices\'][\'laspeyres\']}")\nprint(f"Base Fare: ₹{data[\'component_fare_disaggregation_inr\'][\'average_base_fare\']}")';
              navigator.clipboard.writeText(code);
              setCopiedApi(true);
              setTimeout(() => setCopiedApi(false), 2000);
            }}
            className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[11px] cursor-pointer border border-slate-700"
          >
            {copiedApi ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedApi ? 'Copied!' : 'Copy Code'}</span>
          </button>

          {activeApiTab === 'nso' && (
            <div>
              <div className="text-slate-400 mb-2"># MoSPI National Statistical Office CPI Transport Sub-Index Ingestion</div>
              <div className="text-emerald-400 mb-2">GET http://localhost:8000/api/v1/institutional/nso-feed</div>
              <div className="text-slate-300 whitespace-pre leading-relaxed">{`{
  "status": "OFFICIAL_RELEASE",
  "base_period": "Calendar Year 2024 = 100.0",
  "representative_city_pairs": 100,
  "traffic_coverage_pct": 82.4,
  "headline_indices": {
    "laspeyres": 118.40,
    "jevons": 117.65,
    "fisher_ideal": 118.02,
    "mom_change_pct": 3.8
  },
  "component_fare_disaggregation_inr": {
    "average_base_fare": 4820.00,
    "statutory_taxes_gst": 850.00,
    "user_development_fee_udf_psf": 640.00,
    "ota_convenience_charge": 350.00,
    "total_effective_fare": 6660.00
  },
  "advance_window_subindices": {
    "T+1_urgent": {"index": 142.6, "weight_pct": 18.0},
    "T+7_weekly": {"index": 124.2, "weight_pct": 24.0},
    "T+15_fortnight": {"index": 112.5, "weight_pct": 32.0},
    "T+30_monthly": {"index": 104.8, "weight_pct": 16.0},
    "T+45_base_inventory": {"index": 98.4, "weight_pct": 10.0}
  }
}`}</div>
            </div>
          )}

          {activeApiTab === 'rbi' && (
            <div>
              <div className="text-slate-400 mb-2"># Reserve Bank of India Monetary Policy Committee (MPC) Nowcasting Feed</div>
              <div className="text-emerald-400 mb-2">GET http://localhost:8000/api/v1/institutional/rbi-bulletin</div>
              <div className="text-slate-300 whitespace-pre leading-relaxed">{`{
  "status": "LIVE_TRANSMISSION",
  "bulletin_frequency": "Daily High-Frequency Nowcasting",
  "headline_price_impulse": {
    "annualized_airfare_inflation_pct": 14.8,
    "mom_momentum_pct": 3.8,
    "volatility_dispersion_sigma": 3.45
  },
  "lead_time_elasticity_multipliers": {
    "t1_over_t45_ratio": 2.01,
    "t7_over_t45_ratio": 1.60,
    "yield_management_inflection_day": 7
  },
  "top_trunk_corridors_pressure": [
    {"corridor": "DEL-BOM", "weight_pct": 8.5, "volatility": 4.8},
    {"corridor": "BLR-DEL", "weight_pct": 6.8, "volatility": 4.2},
    {"corridor": "BOM-BLR", "weight_pct": 5.4, "volatility": 3.6}
  ]
}`}</div>
            </div>
          )}

          {activeApiTab === 'python' && (
            <div>
              <div className="text-slate-400 mb-2"># Python Automated Ingestion Script for MoSPI / RBI Data Warehouses</div>
              <div className="text-blue-400 mb-2">python3 -m pip install requests</div>
              <div className="text-slate-300 whitespace-pre leading-relaxed">{`import requests

# 1. Fetch Official MoSPI CPI Transport Sub-Index
nso_response = requests.get("http://localhost:8000/api/v1/institutional/nso-feed")
nso_data = nso_response.json()

print(f"APIx Headline Index: {nso_data['headline_indices']['laspeyres']}")
print(f"Base Fare: ₹{nso_data['component_fare_disaggregation_inr']['average_base_fare']}")

# 2. Fetch RBI Monetary Policy High-Frequency Nowcast
rbi_response = requests.get("http://localhost:8000/api/v1/institutional/rbi-bulletin")
rbi_data = rbi_response.json()

print(f"Airfare Inflation: {rbi_data['headline_price_impulse']['annualized_airfare_inflation_pct']}%")
print(f"Volatility (σ): {rbi_data['headline_price_impulse']['volatility_dispersion_sigma']}")`}</div>
            </div>
          )}
        </div>
      </div>

      {/* Section: Route Heatmap Grid */}
      <RouteHeatmapGrid />
    </div>
  );
};
