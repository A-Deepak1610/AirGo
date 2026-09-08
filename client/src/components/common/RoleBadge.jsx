import React from 'react';

export const RoleBadge = ({ roleKey, className = '' }) => {
  const badgeStyles = {
    PLATFORM_ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
    DATA_ENGINEER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DATA_ANALYST: 'bg-blue-50 text-blue-700 border-blue-200',
    POLICY_REVIEWER: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    API_CONSUMER: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  const labels = {
    PLATFORM_ADMIN: 'Platform Admin',
    DATA_ENGINEER: 'Data Engineer',
    DATA_ANALYST: 'Data Analyst',
    POLICY_REVIEWER: 'Policy Reviewer',
    API_CONSUMER: 'API Consumer'
  };

  const style = badgeStyles[roleKey] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = labels[roleKey] || roleKey;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${style} ${className}`}>
      {label}
    </span>
  );
};
