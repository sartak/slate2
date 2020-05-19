import React, { useImperativeHandle, useRef } from 'react';

export const useSetValue = (forwardRef, originalSetValue) => {
  const elementRef = useRef(null);

  if (!originalSetValue) {
    originalSetValue = (input, value) => input.value = value;
  }

  const setValue = (value) => {
    if (elementRef.current) {
      originalSetValue(elementRef.current, value);
    }
  };

  useImperativeHandle(forwardRef, () => ({
    setValue,
    setValueUnlessFocused: (value) => {
      if (document.activeElement !== elementRef.current) {
        setValue(value);
      }
    },
  }));

  return elementRef;
};
