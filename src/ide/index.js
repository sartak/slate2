import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App';
import { projectReducer } from './project';
import { Preflight, PreflightProvider } from './preflight';

const projectStore = createStore(
  projectReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const preflight = new Preflight(projectStore);

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={projectStore}>
        <PreflightProvider preflight={preflight}>
          <App />
        </PreflightProvider>
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
    render();
  });

  module.hot.accept('./project', () => {
    projectStore.replaceReducer(projectReducer);
  });

  module.hot.accept('./preflight', () => {
    const prev = preflight;
    prev.storeUnsubscribe();

    const next = new Preflight(projectStore);
    prev._hotReplacer(next);
  });
}
