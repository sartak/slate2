import React, { forwardRef } from 'react';
import { useSetValue } from './useSetValue';

export const ColorField = forwardRef(({ value, defaultValue, onChange, readOnly }, ref) => {
  const inputRef = useSetValue(ref);

  const valueProp = (value === undefined || value === null) ? {
    defaultValue,
  } : {
    value,
  };

  return (
    <input
      type="color"
      ref={inputRef}
      placeholder={defaultValue}
      readOnly={readOnly}
      onChange={readOnly ? null : ({ target }) => onChange(target.value)}
      {...valueProp}
    />
  );
});
