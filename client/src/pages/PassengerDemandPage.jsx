import React from 'react';
import { Users, Plane, TrendingUp, Info, BarChart2 } from 'lucide-react';
import { PassengerDemandChart } from '../components/dashboard/PassengerDemandChart';
import { ProcessedRoutesPage } from '../components/routes/ProcessedRoutesPage';

export const PassengerDemandPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Passenger Demand & Traffic Volume Analysis
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Official DGCA scheduled domestic passenger traffic statistics (FY 2024-25). Used to construct city-pair passenger demand weights for the national airfare price index.
        </p>
      </div>

      <PassengerDemandChart />

      <ProcessedRoutesPage />
    </div>
  );
};
