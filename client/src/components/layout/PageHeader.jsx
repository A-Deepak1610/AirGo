import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Reusable PageHeader component for the AirGo statistical platform.
 * Establishes a consistent visual hierarchy:
 * 1. Optional Breadcrumbs
 * 2. Primary Title (the ONLY <h1> on the page) + Optional Status Badge
 * 3. Concise contextual description
 * 4. Primary/Secondary Actions (top-right)
 * 5. Context-aware compact filters (only rendered when needed)
 */
export const PageHeader = ({
  title,
  description,
  badge,
  actions,
  filters,
  breadcrumbs
}) => {
  return (
    <div className="space-y-3.5 pb-4 border-b border-slate-200/90">
      {/* Optional Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium -mb-1">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label || idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {crumb.path && !isLast ? (
                  <Link to={crumb.path} className="hover:text-blue-600 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-[#111827] font-semibold" : ""}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Primary Header Row: Title, Badge, and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-[28px] font-semibold text-[#111827] tracking-tight leading-[1.2]">
              {title}
            </h1>
            {badge && (
              <div className="shrink-0">
                {badge}
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm font-normal text-[#4B5563] leading-relaxed max-w-4xl">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Context-Aware Filter Bar (only rendered when relevant to this page) */}
      {filters && (
        <div className="pt-2.5 flex items-center justify-between gap-3 flex-wrap">
          {filters}
        </div>
      )}
    </div>
  );
};
