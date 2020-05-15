import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import './App.less';
import { OpenProject } from './OpenProject';
import { ProjectEditor } from './ProjectEditor';
import { canLoadProject } from '@ide/bridge';
import { createProjectAction } from './project';

export const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

const App = () => {
  const project = useSelector(project => project, (prev, next) => prev?.id === next?.id);
  if (project) {
    return <ProjectEditor />;
  }
  else if (canLoadProject) {
    return <OpenProject />;
  } else {
    const dispatch = useDispatch();
    dispatch(createProjectAction());
    return null;
  }
};

export default hot(App);
