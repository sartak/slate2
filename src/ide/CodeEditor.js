import React, { useCallback, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { initVimMode } from 'monaco-vim';
import './CodeEditor.less';

export const CodeEditorBase = (props) => {
  return (
    <MonacoEditor
      theme="vs-dark"

      {...props}

      options={{
        minimap: {
          enabled: false,
        },
        ...(props.options || null)
      }}
    />
  );
};

const addVim = (editor, statusBar) => {
  // @Performance: call vimMode.dispose() when the editor is finished
  return initVimMode(editor, statusBar);
};

export const CodeEditorVim = (props) => {
  const editorRef = useRef();

  const statusBarRef = useCallback((statusBar) => {
    if (editorRef.current) {
      addVim(editorRef.current, statusBar);
    }
  }, []);

  const editorDidMount = (editor, ...rest) => {
    editorRef.current = editor;

    if (statusBarRef.current) {
      addVim(editor, statusBarRef.current);
    }

    if (props.editorDidMount) {
      props.editorDidMount(editor, ...rest);
    }
  };

  return (
    <div className="CodeEditorVim">
      <CodeEditorBase
        {...props}
        editorDidMount={editorDidMount}
      />
      <div
        style={{width: Number(props.width)}}
        className="statusBar"
        ref={statusBarRef}
      />
    </div>
  );
};

export const CodeEditor = CodeEditorVim;
