import React, { useState, useEffect } from 'react';

export const TextControlled = ({ value, defaultValue, onChange, readOnly }) => {
  const [isFakeEmpty, setFakeEmpty] = useState(false);

  useEffect(() => {
    if (isFakeEmpty && value !== defaultValue) {
      setFakeEmpty(false);
    }
  }, [value, defaultValue, isFakeEmpty]);

  return (
    <input
      type="text"
      value={isFakeEmpty ? "" : value}
      readOnly={readOnly}
      placeholder={defaultValue}
      onChange={readOnly ? null : ({ target }) => {
        if (target.value === "") {
          setFakeEmpty(true);
          onChange(defaultValue);
        } else {
          setFakeEmpty(false);
          onChange(target.value);
        }
      }}
      onBlur={readOnly ? null : ({ target }) => {
        if (target.value === "") {
          target.value = defaultValue;
          onChange(target.value);
        }
      }}
    />
  );
};
