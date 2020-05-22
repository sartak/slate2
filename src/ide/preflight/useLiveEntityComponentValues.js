import React, { useCallback, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { makeSelectEntityComponents } from '../project/selectors';
import { usePreflight } from '../preflight';
import { DESIGN_TIME } from '../preflight/live-entity-values';

export const useLiveEntityComponentValues = (originalCallback, entityId, ...componentIds) => {
  const callback = useCallback(originalCallback, [entityId, ...componentIds]);
  const entityComponents = useSelector(makeSelectEntityComponents(entityId, componentIds), shallowEqual);

  const preflight = usePreflight();

  useEffect(() => {
    if (entityId === null) {
      return;
    }

    const unsubscribe = preflight.subscribeToLiveEntityValues(callback, entityId, componentIds);
    return unsubscribe;
  }, [callback, entityId, ...componentIds]);

  useEffect(() => {
    if (entityId === null) {
      return;
    }

    callback(DESIGN_TIME, ...entityComponents.map(({ values }) => values));
  }, [callback, entityId, entityComponents]);
};
