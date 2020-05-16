import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App';
import { projectReducer } from './project';
import { Preflight, PreflightProvider } from './preflight';

const renderProject = (container, project) => {
  const projectStore = createStore(
    projectReducer, project,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  );

  const preflight = new Preflight(projectStore);

  ReactDOM.render(
    <Provider store={projectStore}>
      <PreflightProvider preflight={preflight}>
        <App />
      </PreflightProvider>
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
