import React, { createContext, useContext } from 'react';
import './floating.less';

const PanelFloatingContext = createContext(null);
export const useClosePanelFloating = () => useContext(PanelFloatingContext);

export const PanelFloating = ({ close, children }) => {
  return (
    <div className="PanelFloating">
      <button className="close" onClick={close}>x</button>
      <PanelFloatingContext.Provider value={close}>
        {children}
      </PanelFloatingContext.Provider>
    </div>
  );
};
