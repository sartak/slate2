import React, { useCallback, useContext, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { makeSelectEntityComponents } from '../project/selectors';
import { PreflightContext } from '../preflight';
import { DESIGN_TIME } from '../preflight/live-entity-values';

export const useLiveEntityComponentValues = (originalCallback, entityIndex, ...componentIds) => {
  const callback = useCallback(originalCallback, [entityIndex, ...componentIds]);
  const entityComponents = useSelector(makeSelectEntityComponents(entityIndex, componentIds), shallowEqual);

  const preflight = useContext(PreflightContext);

  useEffect(() => {
    const unsubscribe = preflight.subscribeToLiveEntityValues(callback, entityIndex, componentIds);
    return unsubscribe;
  }, [callback, entityIndex, ...componentIds]);

  useEffect(() => {
    callback(DESIGN_TIME, ...entityComponents.map(({ values }) => values));
  }, [callback, entityIndex, entityComponents]);
};
