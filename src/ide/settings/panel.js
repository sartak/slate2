import React from 'react';
import { BuildSettings } from './build';
import { Tabs } from '../tabs';
import { PanelFloating } from '../panel';

export const SettingsPanel = ({ close }) => {
  return (
    <PanelFloating close={close}>
      <div className="SettingsPanel">
        <Tabs
          id='settings'
          tabs={[
            ['Build', BuildSettings],
          ]}
        />
      </div>
    </PanelFloating>
  );
};
