import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import './App.less';
import { OpenProject } from './OpenProject';
import { ProjectEditor } from './ProjectEditor';
import { canLoadProject } from '@ide/bridge';
import { createProjectAction } from './project';

const App = () => {
  const project = useSelector(project => project);
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
