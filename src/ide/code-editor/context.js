import React, { createContext, useContext, useState } from 'react';
import { FloatingEditor } from './floating';

const FloatingEditorContext = createContext(null);

export const useFloatingEditor = () => useContext(FloatingEditorContext);

export const FloatingEditorProvider = ({ children }) => {
  const [editorProps, setEditorProps] = useState(null);

  const callback = (code, options = {}) => {
    // Only do this if the caller changes.
    // editorProps?.close?.();

    setEditorProps({
      ...options,
      close: () => {
        options.close?.();
        setEditorProps(null);
      },
      value: code,
    });

    return () => {
      setEditorProps(null);
    };
  };

  return (
    <FloatingEditorContext.Provider value={callback}>
      {editorProps && (
        <FloatingEditor {...editorProps} />
      )}
      {children}
    </FloatingEditorContext.Provider>
  );
};
