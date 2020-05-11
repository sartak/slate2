import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import './App.less';
import { OpenProject } from './OpenProject';
import { canLoadProject } from '@ide/bridge';

const App = () => {
  const project = useSelector(project => project);
  if (project) {
    return <pre>{JSON.stringify(project, null, 2)}</pre>;
  }
  else if (canLoadProject) {
    return <OpenProject />;
  } else {
    const dispatch = useDispatch();
    dispatch({ type: 'create-project' });
    return null;
  }
};

export default hot(App);
