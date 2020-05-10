import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import App from './App';
import { projectStore } from './project';

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={projectStore}>
        <App />
      </Provider>
    </AppContainer>,
    document.getElementById('app'),
  );
};

document.addEventListener('DOMContentLoaded', () => {
  render(App);
});

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(NextApp);
  });
}
