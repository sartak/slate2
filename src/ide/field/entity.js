import React, { forwardRef } from 'react';
import { useSetValue } from './useSetValue';

export const EntityField = forwardRef(({ value, defaultValue, onChange, readOnly }, ref) => {
  const spanRef = useSetValue(ref, (span, value) => {
    span.innerText = !value || value === 0 ? "(null)" : value;
  });

  return (
    <span ref={spanRef}>{!value || value === 0 ? "(null)" : value}</span>
  );
});
