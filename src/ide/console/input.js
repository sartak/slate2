import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { usePreflight } from '../preflight';
import { CommandEditor } from '../code-editor';

export const ConsoleInput = forwardRef((props, ref) => {
  const preflight = usePreflight();
  const editorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef.current?.focus();
    },
  }));

  return (
    <CommandEditor
      ref={editorRef}
      onCommand={(code) => preflight.eval(code)}
    />
  );
});
