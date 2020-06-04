import React from 'react';
import { EntityList } from '../list-entities';
import { ComponentList } from '../list-components';
import { SystemList } from '../list-systems';
import { Tabs } from '../tabs';

export const PanelLeft = () => {
  return (
    <div className="PanelLeft">
      <Tabs
        id='panel-left'
        tabs={[
          ['Entities', EntityList],
          ['Components', ComponentList],
          ['Systems', SystemList],
        ]}
      />
    </div>
  );
}
