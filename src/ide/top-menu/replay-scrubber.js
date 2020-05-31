import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentReplay } from '../project/selectors';
import { useReplayFrameCallback } from '../preflight/useReplayFrameCallback';

export const ReplayScrubber = () => {
  const replay = useSelector(selectCurrentReplay);
  const inputRef = useRef(null);

  const { beginReplayControl, endReplayControl, setFrame } = useReplayFrameCallback((frame, index) => {
    const { current } = inputRef;
    if (current) {
      current.value = index;
    }
  });

  return (
    <input
      ref={inputRef}
      disabled={!replay}
      type="range"
      min={0}
      max={replay ? replay.frames.length - 1 : 100}
      defaultValue={0}
      onMouseDown={() => beginReplayControl()}
      onMouseUp={() => endReplayControl()}
      onChange={({ target }) => setFrame(target.value)}
    />
  );
};
