import React, { createContext, useContext, useState, useCallback } from 'react';
import { auditedFlightsList } from '../data/scrapedRunsData';

const AuditModalContext = createContext();

export const AuditModalProvider = ({ children }) => {
  // Ground-Truth Audit Modal state
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditFlight, setAuditFlight] = useState(null);

  // Headless Demo Runner Studio state
  const [isHeadlessOpen, setIsHeadlessOpen] = useState(false);
  const [headlessConfig, setHeadlessConfig] = useState({ route: 'BOM-DEL', horizon: 'T+1' });

  // AI Copilot Drawer state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState('');

  // Handlers for Ground-Truth Audit
  const openAuditModal = useCallback((flightOrId) => {
    if (typeof flightOrId === 'string') {
      const found = auditedFlightsList.find(f => f.id === flightOrId || f.flightNumber === flightOrId);
      setAuditFlight(found || auditedFlightsList[0]);
    } else if (flightOrId && typeof flightOrId === 'object') {
      setAuditFlight(flightOrId);
    } else {
      setAuditFlight(auditedFlightsList[0]);
    }
    setIsAuditOpen(true);
  }, []);

  const closeAuditModal = useCallback(() => {
    setIsAuditOpen(false);
    setAuditFlight(null);
  }, []);

  // Handlers for Headless Runner
  const openHeadless = useCallback((config = {}) => {
    setHeadlessConfig(prev => ({ ...prev, ...config }));
    setIsHeadlessOpen(true);
  }, []);

  const closeHeadless = useCallback(() => {
    setIsHeadlessOpen(false);
  }, []);

  // Handlers for AI Copilot
  const openCopilot = useCallback((query = '') => {
    setCopilotInitialQuery(query);
    setIsCopilotOpen(true);
  }, []);

  const closeCopilot = useCallback(() => {
    setIsCopilotOpen(false);
  }, []);

  const toggleCopilot = useCallback(() => {
    setIsCopilotOpen(prev => !prev);
  }, []);

  return (
    <AuditModalContext.Provider
      value={{
        isAuditOpen,
        auditFlight,
        openAuditModal,
        closeAuditModal,
        isHeadlessOpen,
        headlessConfig,
        openHeadless,
        closeHeadless,
        isCopilotOpen,
        copilotInitialQuery,
        openCopilot,
        closeCopilot,
        toggleCopilot
      }}
    >
      {children}
    </AuditModalContext.Provider>
  );
};

export const useAuditModal = () => {
  const context = useContext(AuditModalContext);
  if (!context) {
    throw new Error('useAuditModal must be used within an AuditModalProvider');
  }
  return context;
};
