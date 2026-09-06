import React, { useEffect } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { LiveMarketSnapshot } from '../components/landing/LiveMarketSnapshot';
import { WhatIsApix } from '../components/landing/WhatIsApix';
import { NetworkSection } from '../components/landing/NetworkSection';
import { AirfareDynamicsSection } from '../components/landing/AirfareDynamicsSection';
import { DataPipelineSection } from '../components/landing/DataPipelineSection';
import { AnalyticsPreviewSection } from '../components/landing/AnalyticsPreviewSection';
import { MethodologySection } from '../components/landing/MethodologySection';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage = () => {
  useEffect(() => {
    // Set document title for the landing page
    document.title = "AirGo — Real-Time Airfare Price Index for India (SIH26056)";
  }, []);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 antialiased">
      {/* 1. Navbar */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Section with Network Map Preview */}
        <LandingHero />

        {/* 3. Live Market Snapshot */}
        <LiveMarketSnapshot />

        {/* 4. What is APIx? Transformation Pipeline */}
        <WhatIsApix />

        {/* 5. India Aviation Network (Full Map) */}
        <NetworkSection />

        {/* 6. Airfare Dynamics (Temporal Curves) */}
        <AirfareDynamicsSection />

        {/* 7. End-to-End Data Pipeline Architecture */}
        <DataPipelineSection />

        {/* 8. Real-time Analytics Preview */}
        <AnalyticsPreviewSection />

        {/* 9. Methodology & Trust */}
        <MethodologySection />
      </main>

      {/* 10. Final Call to Action & Footer */}
      <LandingFooter />
    </div>
  );
};
