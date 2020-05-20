import React from 'react';
import { canSaveProject } from '@ide/bridge';
import { useAlert } from '../alert';
import { useSelectorLazy } from '../project/useSelectorLazy';
import { selectProject } from '../project/selectors';
import { saveProject } from '@ide/bridge';

const Button = ({ isBusy, setBusy }) => {
  const alert = useAlert();
  const lazyProject = useSelectorLazy(selectProject);

  const save = () => {
    setBusy(true);
    alert.dismissCategory('save-project');

    const project = lazyProject();
    saveProject(project).then((saved) => {
      setBusy(false);
    }).catch((err) => {
      setBusy(false);
      alert.error(err, { category: 'save-project' });
    });
  };

  return (
    <button disabled={isBusy} onClick={save}>Save Project</button>
  );
};

export const SaveButton = canSaveProject ? Button : () => null;
