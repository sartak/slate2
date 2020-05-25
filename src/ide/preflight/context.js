import React, { createContext, useContext, useState } from 'react';
import { ReactReduxContext } from 'react-redux';
import { PreflightManager } from './manager';

const PreflightContext = createContext(null);

export const usePreflight = () => useContext(PreflightContext);

let currentPreflightManager;

export const PreflightProvider = ({ children }) => {
  const store = useContext(ReactReduxContext).store;
  const [manager, setManager] = useState(() => new PreflightManager(store));

  currentPreflightManager = manager;
  manager._hotReplaceContext = setManager;

  return (
    <PreflightContext.Provider value={manager}>
      {children}
    </PreflightContext.Provider>
  );
};

if (module.hot) {
  module.hot.accept('./manager', () => {
    currentPreflightManager._hotReplace(PreflightManager);
  });
}
