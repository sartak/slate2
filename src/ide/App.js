import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import './app.less';
import { OpenProject } from './open-project';
import { ProjectEditor } from './project-editor';
import { canLoadProject } from '@ide/bridge';
import { createProjectAction } from './project/actions';
import { selectProject } from './project/selectors';
import { AlertProvider } from './alert/context';
import { ConsoleProvider } from './console/context';
import { FloatingEditorProvider } from './code-editor/context';

const App = () => {
  const project = useSelector(selectProject, (prev, next) => prev?.id === next?.id);

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

const AppWrapper = () => {
  return (
    <ConsoleProvider>
      <AlertProvider>
        <FloatingEditorProvider>
          <App />
        </FloatingEditorProvider>
      </AlertProvider>
    </ConsoleProvider>
  );
};

export default hot(AppWrapper);
