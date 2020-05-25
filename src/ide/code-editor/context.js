import React, { createContext, useContext, useRef, useState } from 'react';
import { FloatingEditor } from './floating';

const FloatingEditorContext = createContext(null);

export const useFloatingEditor = () => useContext(FloatingEditorContext);

export const FloatingEditorProvider = ({ children }) => {
  const [editorProps, setEditorProps] = useState(null);
  const editorId = useRef(null);

  const callback = (code, id, options = {}) => {
    if (editorId.current !== id) {
      editorProps?.close?.();
    }

    editorId.current = id;

    setEditorProps({
      ...options,
      editorId: id,
      close: () => {
        options.close?.();
        setEditorProps(null);
      },
      value: code,
    });

    return () => {
      if (editorId.current === id) {
        setEditorProps(null);
      }
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
