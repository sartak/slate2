import React, { createContext, useContext, useState } from 'react';

const PreflightContext = createContext(null);

export const usePreflight = () => useContext(PreflightContext);

export const PreflightProvider = ({ preflight: initialPreflight, children }) => {
  const [preflight, setPreflight] = useState(initialPreflight);

  preflight._hotReplaceContext = setPreflight;

  return (
    <PreflightContext.Provider value={preflight}>
      {children}
    </PreflightContext.Provider>
  );
};
