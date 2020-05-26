import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { CodeEditor } from './index';

export const CommandEditor = forwardRef((props, ref) => {
  const [text, setText] = useState(props.defaultValue ?? '');
  const editorRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef.current?.focus();
    },
  }));

  return (
    <CodeEditor
      language="javascript"
      value={text}
      suppressStatusBar
      insertMode
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
        // @Performance: set this to null when editor is disposed
        editorRef.current = editor;

        editor.addCommand(monaco.KeyCode.Enter, () => {
          let text = editor.getValue();
          if (text === "") {
            return;
          }
          text = text.replace(/\s+$/, "");
          setText('');
          props.onCommand?.(text);
        });

        props.editorDidMount?.(editor, ...rest);
      }}
    />
  );
});
