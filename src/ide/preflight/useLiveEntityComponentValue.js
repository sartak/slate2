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
    const unsubscribe = preflight.subscribeToLiveEntityValue(callback, entityIndex, componentId, fieldId);
    return unsubscribe;
  }, [callback, entityIndex, componentId, fieldId]);

  useEffect(() => {
    callback(DESIGN_TIME, fieldValue);
  }, [callback, entityIndex, componentId, fieldId, fieldValue]);

  return (value) => preflight.changeEntityComponentValue(entityIndex, componentId, fieldId, value);
};

