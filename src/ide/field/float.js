import React, { memo, useEffect, useRef } from 'react';

export const FloatField = memo(({ value, defaultValue, onChange }) => {
  const fieldRef = useRef(null);

  useEffect(() => {
    const { current } = fieldRef;
    if (current) {
      current.value = value;
    }
  }, [value]);

  return (
    <input
      type="number"
      ref={fieldRef}
      defaultValue={value}
      placeholder={defaultValue}
      onChange={({ target }) => onChange(target.value, target)}
      onBlur={({ target }) => {
        if (target.value === "") {
          target.value = defaultValue;
          onChange(defaultValue, target);
        }
      }}
    />
  );
});
