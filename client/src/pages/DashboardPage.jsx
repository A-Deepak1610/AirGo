import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MetricCards } from '../components/dashboard/MetricCards';
import { HistoricalTrendChart } from '../components/dashboard/HistoricalTrendChart';
import { DomesticFareMovement } from '../components/dashboard/DomesticFareMovement';
import { FarePressureGauge } from '../components/dashboard/FarePressureGauge';
import { RoutesInflationTable } from '../components/dashboard/RoutesInflationTable';
import { PassengerDemandChart } from '../components/dashboard/PassengerDemandChart';
import { KeyInsights } from '../components/dashboard/KeyInsights';

export const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top 6 KPI Metric Cards */}
      <MetricCards />

      {/* India Airfare Index - Historical Trend Area Chart */}
      <HistoricalTrendChart />

      {/* 2-Column Row: Domestic Fare Movement & Fare Pressure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DomesticFareMovement />
        <FarePressureGauge />
      </div>

      {/* Routes Driving Airfare Inflation Table */}
      <RoutesInflationTable onNavigateRoutes={() => navigate('/route-intelligence')} />

      {/* Passenger Demand by Route Horizontal Bar Chart */}
      <PassengerDemandChart onNavigateDemand={() => navigate('/passenger-demand')} />

      {/* Key Insights AI Briefing Cards */}
      <KeyInsights onNavigateAnalysis={() => navigate('/route-intelligence')} />
    </div>
  );
};
