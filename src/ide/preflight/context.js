import React, { createContext, useState } from 'react';

const PreflightContext = createContext(null);
export { PreflightContext };

export const PreflightProvider = ({ preflight: initialPreflight, children }) => {
  const [preflight, setPreflight] = useState(initialPreflight);

  preflight._hotReplacer = setPreflight;

  return (
    <PreflightContext.Provider value={preflight}>
      {children}
    </PreflightContext.Provider>
  );
};
