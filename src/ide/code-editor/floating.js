import React from 'react';
import { CodeEditor } from './index';
import { PanelFloating } from '../panel';

export const FloatingEditor = ({ close, ...props }) => {
  return (
    <PanelFloating close={close}>
      <CodeEditor
        {...props}
        height={500}
        width={600}
        commands={{
          q: close,
          qu: close,
          qui: close,
          quit: close,

          qa: close,
          qal: close,
          qall: close,

          wq: close,
          wqa: close,
          wqal: close,
          wqall: close,
        }}
      />
    </PanelFloating>
  );
};
