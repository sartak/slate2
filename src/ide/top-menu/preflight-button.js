import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { preflightRunningAction } from '../project/actions';
import { selectPreflightRunning } from '../project/selectors';

export const PreflightButton = ({ isBusy, setBusy }) => {
  const dispatch = useDispatch();

  const preflightRunning = useSelector(selectPreflightRunning);

  const setPreflightRunning = (preflightRunning) => {
    setBusy(preflightRunning);
    dispatch(preflightRunningAction(preflightRunning));
  };

  if (preflightRunning) {
    return (
      <button onClick={() => setPreflightRunning(false)}>Stop!</button>
    );
  }
  else {
    return (
      <button disabled={isBusy} onClick={() => setPreflightRunning(true)}>Run!</button>
    );
  }
};
