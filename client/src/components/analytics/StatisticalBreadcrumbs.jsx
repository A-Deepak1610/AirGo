import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, Compass, Calendar, Plane, Layers, Database } from 'lucide-react';

export const StatisticalBreadcrumbs = ({ items = [] }) => {
  const navigate = useNavigate();

  const defaultHierarchy = [
    { label: 'National APIx', path: '/index/overview', icon: Globe }
  ];

  const fullItems = [...defaultHierarchy, ...items];

  return (
    <nav className="flex items-center space-x-1.5 text-xs font-medium bg-white border border-slate-200/90 px-3.5 py-2 rounded-xl text-slate-500 overflow-x-auto shadow-2xs">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1.5 flex items-center gap-1">
        Hierarchy:
      </span>
      {fullItems.map((item, idx) => {
        const IconComponent = item.icon || Compass;
        const isLast = idx === fullItems.length - 1;

        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            {isLast ? (
              <span className="flex items-center gap-1.5 font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                <IconComponent className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{item.label}</span>
              </span>
            ) : (
              <button
                onClick={() => item.path && navigate(item.path)}
                className="flex items-center gap-1.5 hover:text-slate-900 transition-colors text-slate-600 py-0.5 px-1.5 rounded-md hover:bg-slate-100"
              >
                <IconComponent className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{item.label}</span>
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
