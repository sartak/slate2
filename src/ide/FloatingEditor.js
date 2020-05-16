import React from 'react';
import { CodeEditor } from './CodeEditor';
import './FloatingEditor.less';

export const FloatingEditor = ({ close, ...props }) => {
  return (
    <div className="FloatingEditor">
      <button className="close" onClick={close}>x</button>
      <CodeEditor
        {...props}
        height={500}
        width={600}
      />
    </div>
  );
};
