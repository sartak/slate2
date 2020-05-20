import React from 'react';
import { canDownloadProject } from '@ide/bridge';
import { useSelectorLazy } from '../project/useSelectorLazy';
import { selectProject } from '../project/selectors';
import { downloadProject } from '@ide/bridge';

const Button = ({ isBusy }) => {
  const lazyProject = useSelectorLazy(selectProject);

  const download = () => {
    const project = lazyProject();
    downloadProject(project);
  };

  return (
    <button disabled={isBusy} onClick={download}>Download Project</button>
  );
};

export const DownloadButton = canDownloadProject ? Button : () => null;
