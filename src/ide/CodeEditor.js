import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as monaco from 'monaco-editor';

export const CodeEditor = () => {
  const dispatch = useDispatch();
  const code = useSelector((project) => project.code);

  const handleChange = (value) => {
    dispatch({'type': 'code', code: value});
  };

  const ref = useCallback((node) => {
    const editor = monaco.editor.create(node, {
      value: code,
      width:293,
      height:291,
      language:"javascript",
      theme:"vs",
      //      options:{
        minimap: {
          enabled: false,
        },
        autoSurround: "never",
        roundedSelection: false,
        renderLineHighlight: "none",
        autoClosingQuotes: "never",
        autoClosingBrackets: "never",
        cursorStyle: 'block',
        language: 'javascript',
        fontFamily: 'Pixelated MS Sans Serif',
        lineNumbers: false,
        scrollbar: {
          horizontal: 'hidden',
          vertical: 'hidden',
        },
        renderValidationDecorations: false,
      //      }
    });
    editor.onDidChangeModelContent((e) => {
      handleChange(editor.getValue());
    });
    editor.focus();
    editor.setPosition({column: 1, lineNumber: 9})
  }, []);


  return (
    <div className="window editor">
      <div className="title-bar">
        <div className="title-bar-text">Form1</div>
        <div className="title-bar-controls">
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="options">
        <div className="option">
          Object: <select><option>Canvas</option></select>
        </div>
        <div className="option">
          Proc: <select><option>Render</option></select>
        </div>
    </div>
    <div className="wrap">
      <div ref={ref} style={{width:293, height:291}} />
      </div>
    </div>
  );
};

