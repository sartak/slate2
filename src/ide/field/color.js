import React, { forwardRef } from 'react';
import { useSetValue } from './useSetValue';

export const ColorField = forwardRef(({ value, defaultValue, onChange }, ref) => {
  const inputRef = useSetValue(ref);

  return (
    <input
      type="color"
      ref={inputRef}
      defaultValue={defaultValue}
      placeholder={defaultValue}
      value={value}
      onChange={({ target }) => onChange(target.value)}
    />
  );
});
