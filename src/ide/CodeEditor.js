import React, { useCallback, useEffect, useRef } from 'react';
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
        ...(props.options || null),
        readOnly: props.readOnly,
      }}
    />
  );
};

const addVim = (editor, statusBar) => {
  return initVimMode(editor, statusBar);
};

export const CodeEditorVim = (props) => {
  const editorRef = useRef(null);
  const vimRef = useRef(null);

  const statusBarRef = useCallback((statusBar) => {
    if (vimRef.current) {
      vimRef.current.dispose();
      vimRef.current = null;
    }

    if (statusBar && editorRef.current) {
      vimRef.current = addVim(editorRef.current, statusBar);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (vimRef.current) {
        vimRef.current.dispose();
        vimRef.current = null;
      }
    };
  }, []);

  const editorDidMount = (editor, ...rest) => {
    editorRef.current = editor;

    if (statusBarRef.current) {
      if (vimRef.current) {
        vimRef.current.dispose();
        vimRef.current = null;
      }
      vimRef.current = addVim(editor, statusBarRef.current);
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
