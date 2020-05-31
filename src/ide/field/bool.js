import React, { forwardRef } from 'react';
import { useSetValue } from './useSetValue';

export const BoolField = forwardRef(({ value, defaultValue, onChange, readOnly }, ref) => {
  const inputRef = useSetValue(ref, (checkbox, value) => {
    checkbox.checked = value;
  });

  const valueProp = (value === undefined || value === null) ? {
    defaultValue,
  } : {
    checked: value,
  };

  return (
    <input
      type="checkbox"
      ref={inputRef}
      readOnly={readOnly}
      onChange={readOnly ? null : ({ target }) => onChange(target.checked)}
      {...valueProp}
    />
  );
});
