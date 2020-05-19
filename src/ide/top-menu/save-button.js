import React from 'react';
import { canSaveProject } from '@ide/bridge';
import { useAlert } from '../alert';
import { useSelector } from 'react-redux';
import { selectProject } from '../project/selectors';
import { saveProject } from '@ide/bridge';

const Button = ({ isBusy, setBusy }) => {
  const alert = useAlert();
  const project = useSelector(selectProject);

  const save = () => {
    setBusy(true);
    alert.dismissCategory('save-project');

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
