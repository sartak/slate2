import React from 'react';
import { useDispatch } from 'react-redux';
import './LoadProject.less';

export const LoadProject = () => {
  const dispatch = useDispatch();

  const createNew = () => {
    dispatch({ type: 'create-new' });
  };

  const loadExisting = () => {
    dispatch({ type: 'create-new' });
  };

  return (
    <ul className="LoadProject">
      <li><button onClick={createNew}>Create new project…</button></li>
      <li><button onClick={loadExisting}>Load existing project…</button></li>
    </ul>
  );
};
