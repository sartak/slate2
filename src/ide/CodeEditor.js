import React from 'react';
import MonacoEditor from 'react-monaco-editor';

export const CodeEditor = (props) => {
  return (
    <div className="CodeEditor">
      <MonacoEditor
        {...props}
      />
    </div>
  );
};
