import React, { useState } from 'react';
import { usePreflight } from '../preflight';

export const ConsoleInput = () => {
  const [text, setText] = useState('');
  const preflight = usePreflight();

  // @Cleanup: support growing vertically instead of scrolling horizontally
  return (
    <input
      type="text"
      className="field"
      value={text}
      onChange={({ target }) => setText(target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setText('');
          preflight.eval(text);
        }
      }}
    / >
  );
}
