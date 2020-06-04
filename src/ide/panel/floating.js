import React from 'react';
import './floating.less';

export const PanelFloating = ({ close, children }) => {
  return (
    <div className="PanelFloating">
      <button className="close" onClick={close}>x</button>
      {children}
    </div>
  );
};
