import React, { useEffect } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingStory } from '../components/landing/LandingStory';
import { DataGapSection } from '../components/landing/DataGapSection';
import { NoiseToSignalSection } from '../components/landing/NoiseToSignalSection';
import { PlatformPhilosophy } from '../components/landing/PlatformPhilosophy';
import { IndexIntroduction } from '../components/landing/IndexIntroduction';
import { HumanJourneySection } from '../components/landing/HumanJourneySection';
import { AbstractTechSection } from '../components/landing/AbstractTechSection';
import { FeatureNavigation } from '../components/landing/FeatureNavigation';
import { LandingCTA } from '../components/landing/LandingCTA';

export const LandingPage = () => {
  useEffect(() => {
    document.title = "Airfare Intelligence Platform · Real-time Airfare Price Index (APIx) for India";
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Editorial Institutional Navbar */}
      <LandingNavbar />

      {/* 2. Full-Screen Cinematic Hero with Exclusive 3D India Flight Network */}
      <LandingHero />

      {/* 3. Storytelling Progression: Every Fare Tells a Story (T+45 to T+1) */}
      <LandingStory />

      {/* 4. The Data Gap: Traditional Collection vs Real-World Airfare */}
      <DataGapSection />

      {/* 5. From Noise to Signal: Interactive Convergence of Floating Quotes */}
      <NoiseToSignalSection />

      {/* 6. Platform Philosophy: Capture · Normalize · Understand */}
      <PlatformPhilosophy />

      {/* 7. Airfare Price Index Conceptual Introduction with Abstract Wave */}
      <IndexIntroduction />

      {/* 8. Human-Centric Perspective: Behind Every Data Point is a Journey */}
      <HumanJourneySection />

      {/* 9. Abstract Technology Foundation */}
      <AbstractTechSection />

      {/* 10. Destination Directory: Feature Discovery Links */}
      <FeatureNavigation />

      {/* 11. Final Statement CTA & Minimal Editorial Footer */}
      <LandingCTA />
    </div>
  );
};

