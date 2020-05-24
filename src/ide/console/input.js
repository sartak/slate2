import React from 'react';
import { usePreflight } from '../preflight';
import { CommandEditor } from '../code-editor';

export const ConsoleInput = () => {
  const preflight = usePreflight();

  return (
    <CommandEditor
      onCommand={(code) => preflight.eval(code)}
    />
  );
}
