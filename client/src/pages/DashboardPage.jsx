import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Calendar, Plane, Building2, RotateCcw } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCards } from '../components/dashboard/MetricCards';
import { HistoricalTrendChart } from '../components/dashboard/HistoricalTrendChart';
import { DomesticFareMovement } from '../components/dashboard/DomesticFareMovement';
import { FarePressureGauge } from '../components/dashboard/FarePressureGauge';
import { RoutesInflationTable } from '../components/dashboard/RoutesInflationTable';
import { KeyInsights } from '../components/dashboard/KeyInsights';
import { LeadTimeCurveChart } from '../components/analytics/LeadTimeCurveChart';
import { PriceDistributionChart } from '../components/analytics/PriceDistributionChart';
import { RouteHeatmapGrid } from '../components/analytics/RouteHeatmapGrid';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('Aug 01 - Aug 31, 2026');
  const [selectedCorridor, setSelectedCorridor] = useState('ALL');
  const [selectedAirline, setSelectedAirline] = useState('ALL');

  const handleResetFilters = () => {
    setDateRange('Aug 01 - Aug 31, 2026');
    setSelectedCorridor('ALL');
    setSelectedAirline('ALL');
  };

  const isFiltered = selectedCorridor !== 'ALL' || selectedAirline !== 'ALL' || dateRange !== 'Aug 01 - Aug 31, 2026';

  const handleExport = () => {
    const reportSummary = {
      report: 'AirGo National Airfare Intelligence Briefing',
      period: dateRange,
      generatedAt: new Date().toISOString(),
      baseYear: '2024 = 100.0',
      headlineIndex: 118.4,
      momInflation: '+3.8%'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportSummary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `airgo_dashboard_briefing_${dateRange.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-[#111827] font-sans">
      {/* 1. Standard Reusable PageHeader */}
      <PageHeader
        title="National Airfare Intelligence Dashboard"
        description="Real-time econometric monitoring of Indian domestic airfares, sector price trends, and index movements across key aviation corridors."
        actions={
          <>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Pipeline: 15m Sync
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[13px] font-medium text-[#111827] transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#6B7280]" />
              Export Briefing
            </button>
          </>
        }
        filters={
          <div className="flex items-center gap-3 flex-wrap w-full text-[13px]">
            {/* Date Range */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[#4B5563] font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="text-[#6B7280]">Date:</span>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent font-medium text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="Aug 01 - Aug 31, 2026">Aug 01 - Aug 31, 2026</option>
                <option value="Jul 01 - Jul 31, 2026">Jul 01 - Jul 31, 2026</option>
                <option value="Jun 01 - Jun 30, 2026">Jun 01 - Jun 30, 2026</option>
              </select>
            </div>

            {/* Corridor */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[#4B5563] font-medium">
              <Plane className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="text-[#6B7280]">Corridor:</span>
              <select 
                value={selectedCorridor} 
                onChange={(e) => setSelectedCorridor(e.target.value)}
                className="bg-transparent font-medium text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Trunk Corridors</option>
                <option value="DEL-BOM">DEL ↔ BOM (Delhi - Mumbai)</option>
                <option value="BLR-DEL">BLR ↔ DEL (Bengaluru - Delhi)</option>
                <option value="BOM-BLR">BOM ↔ BLR (Mumbai - Bengaluru)</option>
                <option value="DEL-HYD">DEL ↔ HYD (Delhi - Hyderabad)</option>
                <option value="BOM-GOI">BOM ↔ GOI (Mumbai - Goa)</option>
              </select>
            </div>

            {/* Carrier */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[#4B5563] font-medium">
              <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="text-[#6B7280]">Carrier:</span>
              <select 
                value={selectedAirline} 
                onChange={(e) => setSelectedAirline(e.target.value)}
                className="bg-transparent font-medium text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Carriers</option>
                <option value="IndiGo">IndiGo (6E)</option>
                <option value="Air India">Air India (AI)</option>
                <option value="Akasa Air">Akasa Air (QP)</option>
                <option value="SpiceJet">SpiceJet (SG)</option>
              </select>
            </div>

            {/* Reset */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[#6B7280] hover:text-[#111827] text-xs font-medium ml-auto cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        }
      />
      {/* 1. Key Statistics (Top KPI Metric Cards) */}
      <MetricCards />

      {/* 2. Overall Airfare Index Trend - Historical Trend Area Chart */}
      <HistoricalTrendChart />

      {/* 3. Advance Booking Elasticity Curve Preview & Price Distribution Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadTimeCurveChart routeCode="DEL-BOM" />
        <PriceDistributionChart routeCode="DEL-BOM" />
      </div>

      {/* 4. Corridor-Wise Price Movements & Domestic Fare Pressure Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DomesticFareMovement />
        <FarePressureGauge />
      </div>

      {/* 5. Routes Driving Airfare Inflation Table */}
      <RoutesInflationTable onNavigateRoutes={() => navigate('/index-apix')} />

      {/* 6. DGCA National Corridors Price Pressure Heatmap Preview */}
      <RouteHeatmapGrid />

      {/* 7. Key Analytical Briefing Insights */}
      <KeyInsights onNavigateAnalysis={() => navigate('/analytics')} />
    </div>
  );
};
