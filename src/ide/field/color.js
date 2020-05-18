import React, { memo, useEffect, useRef } from 'react';

export const ColorField = memo(({ value, defaultValue, onChange }) => {
  const fieldRef = useRef(null);

  useEffect(() => {
    const { current } = fieldRef;
    if (current) {
      current.value = value;
    }
  }, [value]);

  return (
    <input
      type="color"
      ref={fieldRef}
      defaultValue={value}
      placeholder={defaultValue}
      onChange={({ target }) => onChange(target.value, target)}
    />
  );
});
