import React, { forwardRef } from 'react';
import { useSetValue } from './useSetValue';

export const FloatField = forwardRef(({ value, defaultValue, onChange }, ref) => {
  const inputRef = useSetValue(ref);

  return (
    <input
      type="number"
      ref={inputRef}
      defaultValue={defaultValue}
      placeholder={defaultValue}
      value={value}
      onChange={({ target }) => onChange(target.value)}
      onBlur={({ target }) => {
        if (target.value === "") {
          target.value = defaultValue;
          onChange(target.value);
        }
      }}
    />
  );
});
