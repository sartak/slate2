import React from 'react';
import './ProjectEditor.less';
import { PanelCenter } from './PanelCenter';
import { PanelTop } from './PanelTop';
import { PanelLeft } from './PanelLeft';
import { PanelBottom } from './PanelBottom';
import { PanelRight } from './PanelRight';

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
