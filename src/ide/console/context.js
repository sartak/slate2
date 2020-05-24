import React, { createContext, useContext, useState } from 'react';
import { ConsoleManager } from './manager';

const ConsoleContext = createContext(null);

export const useConsole = () => useContext(ConsoleContext);

let currentConsoleManager;

export const ConsoleProvider = ({ children }) => {
  const [manager, setManager] = useState(() => new ConsoleManager().attach());

  currentConsoleManager = manager;
  manager._hotReplaceContext = setManager;

  return (
    <ConsoleContext.Provider value={manager}>
      {children}
    </ConsoleContext.Provider>
  );
};

if (module.hot) {
  module.hot.accept('./manager', () => {
    const prev = currentConsoleManager;
    currentConsoleManager = new ConsoleManager();
    prev._hotReplace(currentConsoleManager);
  });
}
