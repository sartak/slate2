import React from 'react';
import { FloatField } from './field/float';
import { ColorField } from './field/color';
import { EntityField } from './field/entity';

export const BuiltinTypes = {
  entity: {
    zeroValue: 0,
    editor: EntityField,
  },
  float: {
    zeroValue: 0,
    canonicalize: (value, defaultValue) => (
      value === "" ? defaultValue : Number(value)
    ),
    editor: FloatField,
  },
  color: {
    zeroValue: '#000000',
    canonicalize: (value, defaultValue) => (
      value === "" ? defaultValue : value.toLowerCase()
    ),
    editor: ColorField,
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
