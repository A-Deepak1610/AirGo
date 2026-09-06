import React, { useEffect } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { DynamicPricingSection } from '../components/landing/DynamicPricingSection';
import { DataPipelineSection } from '../components/landing/DataPipelineSection';
import { DataSourcesSection } from '../components/landing/DataSourcesSection';
import { RouteNetworkSection } from '../components/landing/RouteNetworkSection';
import { IndexSection } from '../components/landing/IndexSection';
import { HeatmapSection } from '../components/landing/HeatmapSection';
import { LeadTimeElasticitySection } from '../components/landing/LeadTimeElasticitySection';
import { DashboardPreviewSection } from '../components/landing/DashboardPreviewSection';
import { ArchitectureSection } from '../components/landing/ArchitectureSection';
import { BacktestingSection } from '../components/landing/BacktestingSection';
import { FinalCtaAndFooter } from '../components/landing/FinalCtaAndFooter';

export const LandingPage = () => {
  useEffect(() => {
    document.title = "Airfare Intelligence Platform · Real-time Airfare Price Index (APIx) for India";
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sticky Institutional Navbar */}
      <LandingNavbar />

      {/* 1. Full-Width Hero Section with 3D India Flight Arcs & Telemetry */}
      <HeroSection />

      {/* 2. Problem Section (4 Compact Cards) */}
      <ProblemSection />

      {/* 3. Dynamic Pricing Visualization (DEL-BOM 24h Chart & T+1..T+45 Horizons) */}
      <DynamicPricingSection />

      {/* 4. Data Pipeline Section (7-Stage Animated Flow: SOURCE to ANALYZE) */}
      <DataPipelineSection />

      {/* 5. Data Sources & Ethical Compliance Section (11 Platforms + 5 Ethical Checks) */}
      <DataSourcesSection />

      {/* 6. Route Network 3D Section (DGCA Airspace Corridor Radar) */}
      <RouteNetworkSection />

      {/* 7. Price Index Terminal Section (APIx 128.6 +3.84%, Daily/Weekly/Monthly) */}
      <IndexSection />

      {/* 8. Corridor Heatmap Section (Yield Surge & Cooling Intensity) */}
      <HeatmapSection />

      {/* 9. Lead-Time Elasticity Section (T+1 to T+45 Advance Purchase Curves) */}
      <LeadTimeElasticitySection />

      {/* 10. Dashboard Preview Section (Full Interactive React Mockup UI) */}
      <DashboardPreviewSection />

      {/* 11. System Architecture Section (End-to-End Flow & Tech Stack) */}
      <ArchitectureSection />

      {/* 12. 30+ Day Backtesting Section (APIx vs DGCA Monthly Benchmark) */}
      <BacktestingSection />

      {/* 13. Final CTA & Comprehensive Institutional Footer */}
      <FinalCtaAndFooter />
    </div>
  );
};
