import React from 'react';
import MonacoEditor from 'react-monaco-editor';

export const CodeEditorBase = (props) => {
  return (
    <div className="CodeEditor">
      <MonacoEditor
        theme="vs-dark"

        {...props}

        editorDidMount={(editor, ...rest) => {
          if (!props.suppressAutofocus) {
            editor.focus();
          }

          props.editorDidMount?.(editor, ...rest);
        }}

        options={{
          minimap: {
            enabled: false,
          },
          wordWrap: 'on',
          wrappingIndent: 'indent',
          ...(props.options || null),
          readOnly: props.readOnly,
        }}
      />
    </div>
  );
};
