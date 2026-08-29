import React, { useState } from 'react';
import { RoleProvider } from './context/RoleContext';
import { FilterProvider } from './context/FilterContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/layout/FilterBar';
import { MetricCards } from './components/dashboard/MetricCards';
import { HistoricalTrendChart } from './components/dashboard/HistoricalTrendChart';
import { DomesticFareMovement } from './components/dashboard/DomesticFareMovement';
import { FarePressureGauge } from './components/dashboard/FarePressureGauge';
import { RoutesInflationTable } from './components/dashboard/RoutesInflationTable';
import { PassengerDemandChart } from './components/dashboard/PassengerDemandChart';
import { KeyInsights } from './components/dashboard/KeyInsights';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* Left Role-Specific Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Header />

        {/* Global Filter Bar */}
        <FilterBar />

        {/* Dashboard Body */}
        <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
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
          <RoutesInflationTable />

          {/* Passenger Demand by Route Horizontal Bar Chart */}
          <PassengerDemandChart />

          {/* Key Insights AI Briefing Cards */}
          <KeyInsights />

          {/* Page Bottom Disclaimer / Note */}
          <div className="text-center text-[11px] text-slate-400 py-4 border-t border-slate-200/60">
            Official Data Integration: Ministry of Statistics & Programme Implementation (MoSPI) • Directorate General of Civil Aviation (DGCA) • Reserve Bank of India (RBI)
          </div>
        </main>
      </div>

      {/* Dynamic Role Switcher Modal */}
      <RoleSwitcherModal />
    </div>
  );
}

function App() {
  return (
    <RoleProvider>
      <FilterProvider>
        <DashboardContent />
      </FilterProvider>
    </RoleProvider>
  );
}

export default App;
