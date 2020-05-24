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

        wordWrap: "on",
        scrollBeyondLastLine: false,
        scrollBeyondLastColumn: false,

        renderLineHighlight: false,
        scrollbar: {
          useShadows: false,
          vertical: 'hidden',
          horizontal: 'hidden',
        },

        // hide left margin
        lineNumbers: false,
        glyphMargin: false,
        folding: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,

        // hide right margin
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,

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
