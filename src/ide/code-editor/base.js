import React from 'react';
import MonacoEditor from 'react-monaco-editor';

export const CodeEditorBase = (props) => {
  return (
    <div className="CodeEditor">
      <MonacoEditor
        theme="vs-dark"

        {...props}

        options={{
          minimap: {
            enabled: false,
          },
          ...(props.options || null),
          readOnly: props.readOnly,
        }}
      />
    </div>
  );
};
