import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App';
import { projectReducer } from './project';
import { Preflight, PreflightContext } from './preflight';

export default (container, options = {}) => {
  const projectStore = createStore(
    projectReducer, options.project || null,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  );

  const preflight = new Preflight(projectStore);

  ReactDOM.render(
    <Provider store={projectStore}>
      <PreflightContext.Provider value={preflight}>
        <App />
      </PreflightContext.Provider>
    </Provider>,
    container,
  );
};
