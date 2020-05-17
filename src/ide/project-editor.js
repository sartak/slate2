import React from 'react';
import './project-editor.less';
import { PanelCenter } from './panel-center';
import { PanelTop } from './panel-top';
import { PanelLeft } from './panel-left';
import { PanelBottom } from './panel-bottom';
import { PanelRight } from './panel-right';

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
