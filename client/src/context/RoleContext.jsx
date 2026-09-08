import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES } from '../config/roles';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  // Default to PLATFORM_ADMIN so all capabilities are available by default
  const [activeRoleKey, setActiveRoleKey] = useState('PLATFORM_ADMIN');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const currentRole = USER_ROLES[activeRoleKey] || USER_ROLES.PLATFORM_ADMIN;

  const setRole = (roleKey) => {
    if (USER_ROLES[roleKey]) {
      setActiveRoleKey(roleKey);
    }
  };

  const hasPermission = (permissionKey) => {
    if (!currentRole || !currentRole.permissions) return false;
    return !!currentRole.permissions[permissionKey];
  };

  const canAccessPath = (path) => {
    if (!currentRole || !currentRole.allowedPathPrefixes) return false;
    return currentRole.allowedPathPrefixes.some(prefix => path.startsWith(prefix));
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        activeRoleKey,
        setRole,
        hasPermission,
        canAccessPath,
        allRoles: USER_ROLES,
        isRoleModalOpen,
        setIsRoleModalOpen
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
