import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES } from '../config/roles';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [activeRoleKey, setActiveRoleKey] = useState('STATISTICAL_OFFICER');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const currentRole = USER_ROLES[activeRoleKey] || USER_ROLES.STATISTICAL_OFFICER;

  const setRole = (roleKey) => {
    if (USER_ROLES[roleKey]) {
      setActiveRoleKey(roleKey);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        activeRoleKey,
        setRole,
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
