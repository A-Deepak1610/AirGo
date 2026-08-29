import React from 'react';
import { BarChart3, TrendingUp, PieChart, Layers, ShieldCheck, DollarSign, Percent } from 'lucide-react';
import { DomesticFareMovement } from '../components/dashboard/DomesticFareMovement';
import { FarePressureGauge } from '../components/dashboard/FarePressureGauge';

export const FareAnalyticsPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Fare Analytics & Dynamic Pricing Intelligence
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Deep-dive analysis into base airfares, fuel surcharges, convenience fees, seat selection surcharges, and airline pricing curves.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DomesticFareMovement />
        <FarePressureGauge />
      </div>

      {/* Fare Component Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Average Domestic Fare Component Decomposition (₹6,842 Baseline)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Base Airfare (Airline Revenue)</span>
            <div className="text-xl font-black text-slate-900">₹4,950</div>
            <span className="text-xs text-slate-500">72.3% of total ticket price</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Aviation Fuel & Surcharges</span>
            <div className="text-xl font-black text-slate-900">₹1,120</div>
            <span className="text-xs text-slate-500">16.4% dynamic fuel index</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">User Development Fee (UDF) & Tax</span>
            <div className="text-xl font-black text-slate-900">₹472</div>
            <span className="text-xs text-slate-500">6.9% regulated airport fee</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Convenience & OTA Fee</span>
            <div className="text-xl font-black text-slate-900">₹300</div>
            <span className="text-xs text-slate-500">4.4% non-refundable fee</span>
          </div>
        </div>
      </div>
    </div>
  );
};
