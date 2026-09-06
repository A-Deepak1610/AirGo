import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { FilterProvider } from './context/FilterContext';
import { AuditModalProvider, useAuditModal } from './context/AuditModalContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// 7 Core Workflow Pages for SIH26056
// 7 Core Workflow Pages for SIH26056
import { DashboardPage } from './pages/DashboardPage';
import { DataCollectionPage } from './pages/DataCollectionPage';
import { AirfareDataPage } from './pages/AirfareDataPage';
import { IndexApixPage } from './pages/IndexApixPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BacktestingPage } from './pages/BacktestingPage';
import { SystemStatusPage } from './pages/SystemStatusPage';

// Public Institutional Landing Page
import { LandingPage } from './pages/LandingPage';

// Corridor Micro-Level Deep Dive
import { RouteDetailPage } from './pages/RouteDetailPage';

// Interactive AI & Scraper Audit Modals
import { GroundTruthAuditModal } from './components/scraper/GroundTruthAuditModal';
import { HeadlessDemoRunnerModal } from './components/scraper/HeadlessDemoRunnerModal';
import { AICopilotDrawer } from './components/ai/AICopilotDrawer';

function AppLayout() {
  const { 
    isAuditOpen, 
    auditFlight, 
    closeAuditModal, 
    openAuditModal,
    isHeadlessOpen, 
    closeHeadless, 
    openHeadless,
    isCopilotOpen, 
    closeCopilot 
  } = useAuditModal();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* Streamlined Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dynamic Header with Breadcrumbs & Official Persona */}
        <Header />

        {/* Page Content Body */}
        <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          <Routes>
            {/* 7 Core Workflow Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/data-collection" element={<DataCollectionPage />} />
            <Route path="/airfare-data" element={<AirfareDataPage />} />
            <Route path="/index-apix" element={<IndexApixPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/backtesting" element={<BacktestingPage />} />
            <Route path="/system-status" element={<SystemStatusPage />} />

            {/* Corridor Drill-down */}
            <Route path="/index/routes/:routeId" element={<RouteDetailPage />} />

            {/* Backward Compatibility Aliases & Safe Redirects */}
            <Route path="/index/routes" element={<Navigate to="/index-apix" replace />} />
            <Route path="/airfare-index" element={<Navigate to="/index-apix" replace />} />
            <Route path="/route-intelligence" element={<Navigate to="/index-apix" replace />} />
            <Route path="/index/overview" element={<Navigate to="/dashboard" replace />} />
            <Route path="/index/booking-window" element={<Navigate to="/analytics" replace />} />
            <Route path="/index/airlines" element={<Navigate to="/index-apix" replace />} />
            <Route path="/index/flights" element={<Navigate to="/airfare-data" replace />} />
            <Route path="/index/flights/:flightId" element={<Navigate to="/airfare-data" replace />} />
            <Route path="/index/platforms" element={<Navigate to="/analytics" replace />} />
            <Route path="/index/price-analytics" element={<Navigate to="/analytics" replace />} />
            <Route path="/index/inflation" element={<Navigate to="/index-apix" replace />} />
            <Route path="/index/raw-data" element={<Navigate to="/airfare-data" replace />} />
            <Route path="/index/data-quality" element={<Navigate to="/system-status" replace />} />
            <Route path="/index/methodology" element={<Navigate to="/backtesting" replace />} />
            <Route path="/fare-analytics" element={<Navigate to="/analytics" replace />} />
            <Route path="/passenger-demand" element={<Navigate to="/analytics" replace />} />
            <Route path="/anomaly-detection" element={<Navigate to="/analytics" replace />} />
            <Route path="/data-sources" element={<Navigate to="/data-collection" replace />} />
            <Route path="/scraping-monitor" element={<Navigate to="/data-collection" replace />} />
            <Route path="/data-quality" element={<Navigate to="/system-status" replace />} />
            <Route path="/historical-data" element={<Navigate to="/backtesting" replace />} />
            <Route path="/govt-reports" element={<Navigate to="/index-apix" replace />} />
            <Route path="/export-centre" element={<Navigate to="/airfare-data" replace />} />
            <Route path="/users-roles" element={<Navigate to="/system-status" replace />} />
            <Route path="/system-settings" element={<Navigate to="/system-status" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Institutional Compliance Footer */}
          <footer className="text-center text-[11px] text-slate-400 py-4 border-t border-slate-200/60 mt-10">
            SIH26056: Real-time Airfare Price Index for India · Ministry of Statistics & Programme Implementation (MoSPI) · Directorate General of Civil Aviation (DGCA)
          </footer>
        </main>
      </div>

      {/* Ground-Truth Audit Modal (4-Step Screenshot Lightbox) */}
      <GroundTruthAuditModal 
        isOpen={isAuditOpen} 
        onClose={closeAuditModal} 
        flight={auditFlight} 
      />

      {/* Interactive Headless Demo Runner Modal */}
      <HeadlessDemoRunnerModal 
        isOpen={isHeadlessOpen} 
        onClose={closeHeadless} 
        onInspectFlight={(flight) => {
          closeHeadless();
          openAuditModal(flight);
        }}
      />

      {/* AeroIntel AI Econometric Copilot Drawer */}
      <AICopilotDrawer 
        isOpen={isCopilotOpen} 
        onClose={closeCopilot}
        onLaunchScraperDemo={() => {
          closeCopilot();
          openHeadless({ route: 'BOM-DEL', horizon: 'T+1' });
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <FilterProvider>
          <AuditModalProvider>
            <Routes>
              {/* Public Institutional Landing Page (Full-Width) */}
              <Route path="/" element={<LandingPage />} />

              {/* Operational Platform Terminal Suite */}
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </AuditModalProvider>
        </FilterProvider>
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;
