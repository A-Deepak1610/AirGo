import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    dateRange: 'Aug 01 - Aug 31, 2026',
    origin: 'All Airports',
    destination: 'All Airports',
    airline: 'All Airlines',
    routeCategory: 'All',
    fareBreakdown: 'All'
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'Aug 01 - Aug 31, 2026',
      origin: 'All Airports',
      destination: 'All Airports',
      airline: 'All Airlines',
      routeCategory: 'All',
      fareBreakdown: 'All'
    });
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
