import React, { forwardRef } from 'react';
import { useSetValue } from './useSetValue';

export const ColorField = forwardRef(({ defaultValue, onChange }, ref) => {
  const inputRef = useSetValue(ref);

  return (
    <input
      type="color"
      ref={inputRef}
      defaultValue={defaultValue}
      placeholder={defaultValue}
      onChange={({ target }) => onChange(target.value)}
    />
  );
});
