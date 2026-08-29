import React from 'react';
import { KEY_INSIGHTS_DATA } from '../../config/dashboardData';
import { TrendingUp, Plane, AlertTriangle, Compass, ArrowRight } from 'lucide-react';

export const KeyInsights = ({ onNavigateAnalysis }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'trend_up':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'plane':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'compass':
        return <Compass className="w-4 h-4 text-emerald-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Key Insights
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          AI-Driven Briefing Unit – August 2026
        </span>
      </div>

      {/* 4 Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {KEY_INSIGHTS_DATA.map((card) => (
          <div
            key={card.id}
            className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-2xs transition-all"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className={`p-1.5 rounded-md ${card.bgColor} border ${card.borderColor}`}>
                  {getIcon(card.iconType)}
                </div>
                <h3 className="text-xs font-bold text-slate-900">
                  {card.title}
                </h3>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <button
                onClick={onNavigateAnalysis}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{card.linkText}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

