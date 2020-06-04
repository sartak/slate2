import React from 'react';
import './project-editor.less';
import { PanelTop, PanelRight, PanelBottom, PanelLeft, PanelCenter } from './panel';

export const ProjectEditor = () => {
  return (
    <div className="ProjectEditor">
      <div className="v">
        <PanelTop />
        <div className="h">
          <div className="v">
            <div className="h">
              <PanelLeft />
              <PanelCenter />
            </div>
            <PanelBottom />
          </div>
          <PanelRight />
        </div>
      </div>
    </div>
  );
};
