import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loadProject } from '@ide/bridge';
import './OpenProject.less';

export const OpenProject = () => {
  const [isLoading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const dispatch = useDispatch();

  const createProject = () => {
    setLoadError(null);
    dispatch({ type: 'create-project' });
  };

  const loadExistingProject = () => {
    setLoading(true);
    setLoadError(null);

    loadProject().then((project) => {
      setLoading(false);
      if (project) {
        dispatch({ type: 'load-project', project });
      }
    }).catch((error) => {
      setLoading(false);
      setLoadError(error);
    });
  };

  return (
    <div className="OpenProject">
      {loadError && <div className="error-banner">{loadError.toString()}</div>}
      <ul className="buttons">
        <li><button disabled={isLoading} onClick={createProject}>Create new project</button></li>
        <li><button disabled={isLoading} onClick={loadExistingProject}>Load existing project…</button></li>
      </ul>
    </div>
  );
};
