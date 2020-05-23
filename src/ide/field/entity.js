import React, { forwardRef } from 'react';
import { useSetValue } from './useSetValue';

export const EntityField = forwardRef(({ value, defaultValue, onChange }, ref) => {
  const spanRef = useSetValue(ref, (span, value) => {
    span.innerText = !value ? "(null)" : value;
  });

  return (
    <span ref={spanRef}>{!value ? "(null)" : value}</span>
  );
});
