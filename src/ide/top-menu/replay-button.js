import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { preflightRunningAction } from '../project/actions';
import { selectLatestRecording } from '../project/selectors';

export const ReplayButton = ({ isBusy, setBusy }) => {
  const dispatch = useDispatch();
  const latestRecording = useSelector(selectLatestRecording);

  const runPreflight = () => {
    setBusy(true);
    dispatch(preflightRunningAction(true, latestRecording));
  };

  return (
    <button disabled={isBusy || !latestRecording} onClick={runPreflight}>Replay!</button>
  );
};
