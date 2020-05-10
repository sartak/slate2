import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

export const Canvas = () => {
  const dispatch = useDispatch();
  const error = useSelector((project) => project.error);

  const ref = useCallback((canvas) => {
    dispatch({type: 'canvas', canvas});
  }, []);

  return (
    <div className="window canvas" style={{position: 'relative'}}>
      <div className="title-bar">
        <div className="title-bar-text">Form1</div>
        <div className="title-bar-controls">
          <button aria-label="Close"></button>
        </div>
      </div>
      {error && <span style={{position: 'absolute', 'top': 23, 'left': 4, color: 'red', background: 'white'}}>{String(error)}</span>}
      <canvas ref={ref} width={300} height={319} />
    </div>
  );
};


