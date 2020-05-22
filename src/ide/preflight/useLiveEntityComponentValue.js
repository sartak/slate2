import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeSelectEntityComponentValue } from '../project/selectors';
import { usePreflight } from '../preflight';
import { DESIGN_TIME } from '../preflight/live-entity-values';

export const useLiveEntityComponentValue = (originalCallback, entityId, componentId, fieldId) => {
  const callback = useCallback(originalCallback, [entityId, componentId, fieldId]);
  const fieldValue = useSelector(makeSelectEntityComponentValue(entityId, componentId, fieldId));

  const preflight = usePreflight();

  useEffect(() => {
    if (entityId === null) {
      return;
    }

    const unsubscribe = preflight.subscribeToLiveEntityValue(callback, entityId, componentId, fieldId);
    return unsubscribe;
  }, [callback, entityId, componentId, fieldId]);

  useEffect(() => {
    if (entityId === null) {
      return;
    }

    callback(DESIGN_TIME, fieldValue);
  }, [callback, entityId, componentId, fieldId, fieldValue]);

  if (entityId === null) {
    return () => console.error('No entityId');
  }

  return (value) => preflight.changeEntityComponentValue(entityId, componentId, fieldId, value);
};
