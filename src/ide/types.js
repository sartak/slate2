import React from 'react';

export const BuiltinTypes = {
  entity: {
    zeroValue: 0,
    editor: (value) => (
      <span>{value === null ? "(null)" : value}</span>
    ),
  },
  float: {
    zeroValue: 0,
    canonicalize: (value, defaultValue) => (
      value === "" ? defaultValue : Number(value)
    ),
    editor: (value, onChange, defaultValue) => (
      <input
        type="number"
        value={value}
        placeholder={defaultValue}
        onChange={({ target }) => onChange(target.value, target)}
        onBlur={({ target }) => {
          if (target.value === "") {
            target.value = defaultValue;
            onChange(defaultValue, target);
          }
        }}
      />
    ),
  },
  color: {
    zeroValue: '#000000',
    canonicalize: (value, defaultValue) => (
      value === "" ? defaultValue : value.toLowerCase()
    ),
    editor: (value, onChange) => (
      <input
        type="color"
        value={value}
        onChange={({ target }) => onChange(target.value, target)}
      />
    ),
  },
};

export const zeroValueForType = (type) => BuiltinTypes[type].zeroValue;

export const editorForType = (type) => BuiltinTypes[type].editor;

export const canonicalizeValue = (type, value, defaultValue) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  const { canonicalize } = BuiltinTypes[type];
  if (!canonicalize) {
    throw new Error(`Unhandled type ${type} for canonicalizeValue`);
  }

  return canonicalize(value, defaultValue);
};
