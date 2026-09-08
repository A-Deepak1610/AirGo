import React from 'react';
import { Lock } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

/**
 * ActionGuard wraps action buttons or controls.
 * If user has permission, renders children.
 * If not, renders children as disabled with a Lock icon and contextual tooltip.
 */
export const ActionGuard = ({
  permission,
  requiredRoleLabel = 'Administrator',
  hideIfUnauthorized = false,
  children,
  className = ''
}) => {
  const { hasPermission } = useRole();
  const isAllowed = hasPermission(permission);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (hideIfUnauthorized) {
    return null;
  }

  // Clone single element if valid or wrap in div with disabled overlay
  return (
    <div
      className={`relative inline-flex items-center group cursor-not-allowed ${className}`}
      title={`Permission required: ${requiredRoleLabel}`}
    >
      <div className="opacity-45 pointer-events-none filter grayscale select-none">
        {children}
      </div>
      <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-800 text-white shadow-xs z-10">
        <Lock className="w-2.5 h-2.5" />
      </div>
    </div>
  );
};
