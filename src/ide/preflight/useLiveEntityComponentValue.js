import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeSelectEntityComponentValue } from '../project/selectors';
import { usePreflight } from '../preflight';
import { DESIGN_TIME } from '../preflight/live-entity-values';

export const useLiveEntityComponentValue = (originalCallback, entityIndex, componentId, fieldId) => {
  const callback = useCallback(originalCallback, [entityIndex, componentId, fieldId]);
  const fieldValue = useSelector(makeSelectEntityComponentValue(entityIndex, componentId, fieldId));

  const preflight = usePreflight();

  useEffect(() => {
    if (entityIndex === -1) {
      return;
    }

    const unsubscribe = preflight.subscribeToLiveEntityValue(callback, entityIndex, componentId, fieldId);
    return unsubscribe;
  }, [callback, entityIndex, componentId, fieldId]);

  useEffect(() => {
    if (entityIndex === -1) {
      return;
    }

    callback(DESIGN_TIME, fieldValue);
  }, [callback, entityIndex, componentId, fieldId, fieldValue]);

  if (entityIndex === -1) {
    return () => console.error('No entityIndex');
  }

  return (value) => preflight.changeEntityComponentValue(entityIndex, componentId, fieldId, value);
};
