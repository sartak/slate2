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
    buildProject(project).then((stdout, stderr) => {
      if (stdout) {
        console.log(stdout);
      }

      if (stderr) {
        console.error(stderr);
      }

      alert.success('Build successful', { category: 'build-project' });
      setBusy(false);
    }).catch((err) => {
      const { error, stdout, stderr } = err;
      if (stdout) {
        if (stdout.match(/error/i)) {
          console.error(stdout);
        } else {
          console.log(stdout);
        }
      }

      if (stderr) {
        console.error(stderr);
      }

      console.error(error ?? err);
      alert.error('Failed to build', { category: 'build-project' });
    });
  };

  return (
    <button disabled={isBusy} onClick={build}>Build Project</button>
  );
};

export const BuildButton = canBuildProject ? Button : () => null;
