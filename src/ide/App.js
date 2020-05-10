import React from 'react';
import { hot } from 'react-hot-loader/root';
import './App.less';

const App = () => {
  return (
    <div class="window">
      <div className="title-bar">
        <div className="title-bar-text">slate2</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <h1>slate2</h1>
      </div>
    </div>
  );
};

export default hot(App);
