import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loadProject } from '@ide/bridge';
import { createProjectAction, loadProjectAction } from './project/actions';
import { upgradeProject } from './project/upgrade';
import { useAlert } from './alert';
import './open-project.less';

export const OpenProject = () => {
  const [isLoading, setLoading] = useState(false);
  const alert = useAlert();

  const dispatch = useDispatch();

  const createProject = () => {
    alert.dismissCategory('load-project', { immediately: true });
    dispatch(createProjectAction());
  };

  const loadExistingProject = () => {
    setLoading(true);
    alert.dismissCategory('load-project');

    loadProject().then((project) => {
      alert.dismissCategory('load-project', { immediately: true });
      setLoading(false);
      if (project) {
        upgradeProject(project);
        dispatch(loadProjectAction(project));
      }
    }).catch((error) => {
      setLoading(false);
      alert.error(error, { category: 'load-project' });
    });
  };

  return (
    <div className="OpenProject">
      <ul className="buttons">
        <li><button disabled={isLoading} onClick={createProject}>Create new project</button></li>
        <li><button disabled={isLoading} onClick={loadExistingProject}>Load existing project…</button></li>
      </ul>
    </div>
  );
};
