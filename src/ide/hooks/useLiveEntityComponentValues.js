import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeSelectEntityComponents } from '../project/selectors';

export const useLiveEntityComponentValues = (originalCallback, entityIndex, ...componentIds) => {
  const callback = useCallback(originalCallback, [entityIndex, ...componentIds]);
  const entityComponents = useSelector(makeSelectEntityComponents(entityIndex, componentIds));

  useEffect(() => {
    callback(...entityComponents.map(({ values }) => values));
  }, [callback, entityIndex, ...componentIds]);
};
