import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertManager } from './manager';

const AlertContext = createContext(null);

export const useAlert = () => useContext(AlertContext);

let currentAlertProvider;

const Alert = (alert) => {
  const { id, message, type } = alert;
  const [height, setHeight] = useState(null);
  const manager = useAlert();

  const ref = useCallback((node) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height);
      manager.provideSetHeight(id, setHeight);
    }
  }, []);

  return (
    <div ref={ref} style={{height}} className="container">
      <div className={`${type} banner`}>
        {message}
        <button onClick={() => manager.dismissAlerts([id])}>x</button>
      </div>
    </div>
  );
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [manager, setManager] = useState(() => new AlertManager(alerts, setAlerts));

  currentAlertProvider = manager;
  manager._hotReplaceContext = setManager;

  return (
    <AlertContext.Provider value={manager}>
      <div className="alert-banners">
        {alerts.map((alert) => (
          <Alert key={alert.id} {...alert} />
        ))}
      </div>
      {children}
    </AlertContext.Provider>
  );
};

if (module.hot) {
  module.hot.accept('./manager', () => {
    const prev = currentAlertProvider;
    currentAlertProvider = new AlertManager();
    prev._hotReplace(currentAlertProvider);
  });
}
