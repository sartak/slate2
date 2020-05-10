import React from 'react';
import { hot } from 'react-hot-loader/root';
import { useSelector } from 'react-redux';
import { LoadProject } from './LoadProject';
import { CodeEditor } from './CodeEditor';
import { Canvas } from './Canvas';
import './App.less';
const remote = require('electron').remote;

const App = () => {
  const project = useSelector(state => state);
  const error = useSelector(state => state ? state.error : null);
  return (
    <div className="app window">
      <div className="title-bar">
        <div className="title-bar-text">Visual Advanced</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => remote.getCurrentWindow().minimize()}></button>
          <button aria-label="Maximize" onClick={() => remote.getCurrentWindow().isMaximized() ? remote.getCurrentWindow().unmaximize() : remote.getCurrentWindow().maximize()}></button>
          <button aria-label="Close" onClick={() => remote.getCurrentWindow().close()}></button>
        </div>
      </div>
      <div className="window-body">
        { project ? (
          <div>
            <div className="io">
              <CodeEditor />
              <Canvas />
            </div>
          </div>
        ) : <LoadProject /> }
      </div>
    </div>
  );
};

export default hot(App);
