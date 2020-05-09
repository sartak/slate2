import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  return React.createElement('h1', null, 'slate2');
};

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    React.createElement(App, {}, null),
    document.getElementById('app'),
  );
});
