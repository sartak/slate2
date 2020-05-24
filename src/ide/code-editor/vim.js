import React, { useCallback, useEffect, useRef } from 'react';
import { CodeEditorBase } from './base';
import { initVimMode, VimMode } from 'monaco-vim';

const showConfirm = (vim, text) => {
  if (vim && vim.statusBar) {
    const div = document.createElement('div');
    div.innerText = text;
    const html = div.innerHTML;

    vim?.statusBar?.showNotification(
      '<span style="color: red">' + html + '</span>',
      {
        bottom: true,
        duration: 5000,
      },
    );
  }
  else {
    alert(text);
  }
};

// monaco-vim's excommands are global, so to make them contextual we weakmap
// them by the monaco editor instance
const commandsForEditor = new WeakMap();
const vimForEditor = new WeakMap();
const definedCommand = {};
const installCommands = (editor, vim, commands) => {
  commandsForEditor.set(editor, commands);
  vimForEditor.set(editor, vim);

  Object.keys(commands).forEach((name) => {
    if (!definedCommand[name]) {
      definedCommand[name] = true;
      VimMode.Vim.defineEx(name, name, (cm) => {
        const commands = commandsForEditor.get(cm.editor);
        const vim = vimForEditor.get(cm.editor);
        if (commands && commands[name]) {
          commands[name](cm.editor, vim);
        } else {
          showConfirm(vim, `Not an editor command ":${name}"`);
        }
      });
    }
  });
};

const addVim = (editor, statusBar, commands, props) => {
  const vim = initVimMode(editor, statusBar);

  if (commands) {
    installCommands(editor, vim, commands);
  }

  if (props.insertMode) {
    // @Upstream: ask for an API
    const browserEvent = new Event('keydown');
    browserEvent.keyCode = 39;
    browserEvent.key = "i";

    const wrapperEvent = new Event('keydown');
    wrapperEvent.keyCode = 39;
    wrapperEvent.browserEvent = browserEvent;

    vim.handleKeyDown(wrapperEvent);
  }

  return vim;
};

export const CodeEditorVim = (props) => {
  const { suppressStatusBar } = props;

  const editorRef = useRef(null);
  const vimRef = useRef(null);

  const statusBarRef = useCallback((statusBar) => {
    vimRef.current?.dispose();
    vimRef.current = null;

    if (statusBar && editorRef.current) {
      vimRef.current = addVim(editorRef.current, statusBar, props.commands, props);
    }
  }, []);

  useEffect(() => {
    return () => {
      vimRef.current?.dispose();
      vimRef.current = null;
    };
  }, []);

  const editorDidMount = (editor, ...rest) => {
    editorRef.current = editor;

    if (statusBarRef.current || suppressStatusBar) {
      vimRef.current?.dispose();
      vimRef.current = addVim(editor, statusBarRef.current, props.commands, props);
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
      {!suppressStatusBar && (
        <div
          style={{width: Number(props.width)}}
          className="statusBar"
          ref={statusBarRef}
        />
      )}
    </div>
  );
};
