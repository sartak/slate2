import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App';
import { projectReducer } from './project';

export default (container, options = {}) => {
  const projectStore = createStore(projectReducer, options.project || null);

  ReactDOM.render(
    <Provider store={projectStore}>
      <App />
    </Provider>,
    container,
  );
};