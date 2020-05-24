import React from 'react';
import { CodeEditor } from './index';
import './floating.less';

export const FloatingEditor = ({ close, ...props }) => {
  return (
    <div className="FloatingEditor">
      <button className="close" onClick={close}>x</button>
      <CodeEditor
        {...props}
        height={500}
        width={600}
        commands={{
          q: close,
          qu: close,
          qui: close,
          quit: close,

          wq: close,
          wqa: close,
          wqal: close,
          wqall: close,
        }}
      />
    </div>
  );
};
