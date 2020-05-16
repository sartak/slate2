import React, { createContext } from 'react';

const PreflightContext = createContext(null);
export { PreflightContext };

export const PreflightProvider = ({ preflight, children }) => {
  return (
    <PreflightContext.Provider value={preflight}>
      {children}
    </PreflightContext.Provider>
  );
};
