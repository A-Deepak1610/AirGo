import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { FilterProvider } from './context/FilterContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/layout/FilterBar';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';

// Dedicated Pages
import { DashboardPage } from './pages/DashboardPage';
import { RouteIntelligencePage } from './pages/RouteIntelligencePage';
import { AirfareIndexPage } from './pages/AirfareIndexPage';
import { FareAnalyticsPage } from './pages/FareAnalyticsPage';
import { PassengerDemandPage } from './pages/PassengerDemandPage';
import { AnomalyDetectionPage } from './pages/AnomalyDetectionPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { ScrapingMonitorPage } from './pages/ScrapingMonitorPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { HistoricalDataPage } from './pages/HistoricalDataPage';
import { GovtReportsPage } from './pages/GovtReportsPage';
import { ExportCentrePage } from './pages/ExportCentrePage';
import { UsersRolesPage } from './pages/UsersRolesPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* Role-Specific Dark Sidebar */}
      <Sidebar />

      {/* Main Content View Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dynamic Header with Route Breadcrumbs & Persona */}
        <Header />

        {/* Properly Aligned Global Filter Bar */}
        <FilterBar />

        {/* Page Content Body */}
        <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/route-intelligence" element={<RouteIntelligencePage />} />
            <Route path="/airfare-index" element={<AirfareIndexPage />} />
            <Route path="/fare-analytics" element={<FareAnalyticsPage />} />
            <Route path="/passenger-demand" element={<PassengerDemandPage />} />
            <Route path="/anomaly-detection" element={<AnomalyDetectionPage />} />
            <Route path="/data-sources" element={<DataSourcesPage />} />
            <Route path="/scraping-monitor" element={<ScrapingMonitorPage />} />
            <Route path="/data-quality" element={<DataQualityPage />} />
            <Route path="/historical-data" element={<HistoricalDataPage />} />
            <Route path="/govt-reports" element={<GovtReportsPage />} />
            <Route path="/export-centre" element={<ExportCentrePage />} />
            <Route path="/users-roles" element={<UsersRolesPage />} />
            <Route path="/system-settings" element={<SystemSettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Page Footer */}
          <footer className="text-center text-[11px] text-slate-400 py-4 border-t border-slate-200/60 mt-10">
            Official Data Integration: Ministry of Statistics & Programme Implementation (MoSPI) • Directorate General of Civil Aviation (DGCA) • Reserve Bank of India (RBI)
          </footer>
        </main>
      </div>

      {/* RBAC Role Switcher Modal */}
      <RoleSwitcherModal />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <FilterProvider>
          <AppLayout />
        </FilterProvider>
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;
