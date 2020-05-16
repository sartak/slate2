export const fieldZeroValue = ({ type }) => {
  switch (type) {
    case 'entity':
    case 'float':
      return 0;
    case 'color':
      return '#000000';
    default:
      throw new Error(`Unhandled type ${type} for fieldZeroValue`);
  }
};

export const canonicalizeFieldValue = ({ type, default: defaultValue }, value) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  switch (type) {
    case 'float': {
      return value === "" ? defaultValue : Number(value);
    }
    case 'color': {
      return value === "" ? defaultValue : value.toLowerCase();
    }
    default: {
      throw new Error(`Unhandled type ${type} for canonicalizeFieldValue`);
    }
  }
};
