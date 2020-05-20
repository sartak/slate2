import React from 'react';
import { canBuildProject } from '@ide/bridge';
import { useAlert } from '../alert';
import { useSelectorLazy } from '../project/useSelectorLazy';
import { selectProject } from '../project/selectors';
import { buildProject } from '@ide/bridge';

const Button = ({ isBusy, setBusy }) => {
  const alert = useAlert();
  const lazyProject = useSelectorLazy(selectProject);

  const build = () => {
    setBusy(true);
    alert.dismissCategory('build-project');

    const project = lazyProject();
    buildProject(project).then((directory) => {
      alert.success(`Built in ${directory}`, { category: 'build-project' });
      setBusy(false);
    }).catch((err) => {
      setBusy(false);
      alert.error(err, { category: 'build-project' });
    });
  };

  return (
    <button disabled={isBusy} onClick={build}>Build Project</button>
  );
};

export const BuildButton = canBuildProject ? Button : () => null;
