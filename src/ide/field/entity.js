import React, { memo, useRef } from 'react';

export const EntityField = memo(({ value }) => {
  return <span>{!value ? "(null)" : value}</span>
});
