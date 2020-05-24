import React, { useState } from 'react';
import { CodeEditor } from './index';

export const CommandEditor = (props) => {
  const [text, setText] = useState(props.defaultValue ?? '');

  return (
    <CodeEditor
      language="javascript"
      value={text}
      suppressStatusBar
      options={{
        automaticLayout: true,
        renderLineHighlight: false,
        scrollbar: {
          vertical: 'hidden',
          horizontal: 'hidden',
        },
        scrollBeyondLastLine: false,
        scrollBeyondLastColumn: false,
        lineNumbers: false,
        wordWrap: "on",
        ...props.options,
      }}

      {...props}

      onChange={(value) => {
        setText(value);
        props.onChange?.(value);
      }}

      editorDidMount={(editor, ...rest) => {
        editor.addCommand(monaco.KeyCode.Enter, () => {
          const text = editor.getValue();
          setText('');
          props.onCommand?.(text);
        });

        props.editorDidMount?.(editor, ...rest);
      }}
    />
  );
};
