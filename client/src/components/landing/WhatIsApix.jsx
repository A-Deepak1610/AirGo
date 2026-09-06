import React, { useState } from 'react';
import { 
  Database, 
  Filter, 
  Layers, 
  Cpu, 
  TrendingUp 
} from 'lucide-react';

export const WhatIsApix = () => {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      step: '01',
      tag: 'COLLECT',
      title: 'Automated Harvester Feeds',
      summary: 'Airline & OTA fare observations',
      detail: 'High-frequency scrapers poll IndiGo, Air India, SpiceJet, Akasa Air, and OTAs (EaseMyTrip, MakeMyTrip, Ixigo, Cleartrip) across standardized advance purchase intervals (T+1 to T+45).',
      metric: '4,720 quotes / batch',
      icon: Database,
      accent: 'border-blue-500/40 text-blue-400 bg-blue-500/10'
    },
    {
      step: '02',
      tag: 'CLEAN',
      title: 'Statistical Cleansing',
      summary: 'Duplicates, missing values and outliers',
      detail: 'Rejects corrupted quotes, flight cancellations, and extreme pricing anomalies via rigorous Tukey 1.5× Interquartile Range (IQR) fences while preserving authentic market surges.',
      metric: '99.1% valid yield',
      icon: Filter,
      accent: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
    },
    {
      step: '03',
      tag: 'NORMALIZE',
      title: 'Disaggregation Engine',
      summary: 'Base fare, taxes and charges',
      detail: 'Separates pure airline commercial yield (~81.5%) from statutory GST levies (~9.2%), AERA User Development Fees (~6.8%), and intermediary payment convenience charges.',
      metric: '4-part price split',
      icon: Layers,
      accent: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10'
    },
    {
      step: '04',
      tag: 'COMPUTE',
      title: 'Econometric Weighting',
      summary: 'Route and basket methodology',
      detail: 'Calibrated against official DGCA annual passenger volume weights. Supports Laspeyres fixed base, Jevons geometric mean, and Fisher Ideal formulations.',
      metric: 'Base 2024 = 100.0',
      icon: Cpu,
      accent: 'border-purple-500/40 text-purple-400 bg-purple-500/10'
    },
    {
      step: '05',
      tag: 'APIx',
      title: 'Airfare Price Index',
      summary: 'Daily airfare price movement',
      detail: 'Synthesizes elementary corridor prices into a single national price index, providing policymakers, researchers, and travellers with an objective measure of airfare inflation.',
      metric: '118.40 Real-time',
      icon: TrendingUp,
      accent: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
    }
  ];

  return (
    <section id="index" className="py-16 sm:py-20 bg-[#080C14] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
            <span>Econometric Transformation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans">
            From Fare Quotes to Market Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            APIx transforms high-frequency airfare observations into a standardized measure of price movement across representative Indian routes.
          </p>
        </div>

        {/* 5-Stage Sequential Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStage === idx;

            return (
              <div
                key={idx}
                onClick={() => setActiveStage(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#111A30] border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                    : 'bg-[#0D1527] border-slate-800/90 hover:border-slate-700/90'
                }`}
              >
                <div>
                  {/* Top Bar: Tag & Number */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border ${stage.accent}`}>
                      {stage.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {stage.step}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="mt-3 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-300" />
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {stage.title}
                    </h3>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    {stage.summary}
                  </p>
                </div>

                {/* Bottom Metric Pill */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Metric:</span>
                  <span className="font-bold text-cyan-300">{stage.metric}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Expanded Detail Card */}
        <div className="bg-[#0B1120] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400">
                Stage {stages[activeStage].step}: {stages[activeStage].tag}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-bold text-white">
                {stages[activeStage].title}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {stages[activeStage].detail}
            </p>
          </div>

          <div className="shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              {stages[activeStage].metric}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
