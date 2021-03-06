import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './app';
import { projectReducer } from './project/reducer';
import { upgradeProject } from './project/upgrade';

const renderProject = (container, project) => {
  if (project) {
    upgradeProject(project);
  }

  const projectStore = createStore(
    projectReducer, project,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  );

  ReactDOM.render(
    <Provider store={projectStore}>
      <App />
    </Provider>,
    container,
  );
};

const download = (url) => {
  return fetch(url).then((res) => res.json()).catch((err) => {
    alert(err);
  });
};

export default (container, options = {}) => {
  if (typeof options === 'string') {
    return download(options).then((project) => {
      renderProject(container, project);
    });
  }

  const { project } = options;
  if (typeof project === 'string') {
    download(project).then((projectContent) => {
      renderProject(container, projectContent);
    });
  } else if (project) {
    renderProject(container, project);
  } else {
    renderProject(container, null);
  }
};
