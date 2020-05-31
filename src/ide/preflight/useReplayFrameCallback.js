import React, { useEffect } from 'react';
import { usePreflight } from '../preflight';

export const useReplayFrameCallback = (callback) => {
  const preflight = usePreflight();

  useEffect(() => {
    const unsubscribe = preflight.subscribeToReplayFrame(callback);
    return unsubscribe;
  }, [callback]);

  return {
    beginReplayControl: () => preflight.beginReplayControl(),
    setFrame: (index) => preflight.setReplayFrameIndex(index),
    endReplayControl: () => preflight.endReplayControl(),
  };
};
