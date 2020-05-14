import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App';
import { projectReducer } from './project';

const projectStore = createStore(
  projectReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={projectStore}>
        <App />
      </Provider>
    </AppContainer>,
    document.getElementById('App'),
  );
};

document.addEventListener('DOMContentLoaded', () => {
  render(App);
});

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render();
  });

  module.hot.accept('./project', () => {
    const NextProject = require('./project');
    projectStore.replaceReducer(NextProject.projectReducer);
  });
}
