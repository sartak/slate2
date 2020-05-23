import React, { forwardRef } from 'react';
import { useSetValue } from './useSetValue';

export const FloatField = forwardRef(({ value, defaultValue, onChange, readOnly }, ref) => {
  const inputRef = useSetValue(ref);

  const valueProp = (value === undefined || value === null) ? {
    defaultValue,
  } : {
    value,
  };

  return (
    <input
      type="number"
      ref={inputRef}
      placeholder={defaultValue}
      readOnly={readOnly}
      onChange={readOnly ? null : ({ target }) => onChange(target.value)}
      onBlur={readOnly ? null : ({ target }) => {
        if (target.value === "") {
          target.value = defaultValue;
          onChange(target.value);
        }
      }}
      {...valueProp}
    />
  );
});
