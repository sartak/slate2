import React from 'react';
import { canDownloadProject } from '@ide/bridge';
import { useSelector } from 'react-redux';
import { selectProject } from '../project/selectors';
import { downloadProject } from '@ide/bridge';

const Button = ({ isBusy }) => {
  const project = useSelector(selectProject);

  const download = () => {
    downloadProject(project);
  };

  return (
    <button disabled={isBusy} onClick={download}>Download Project</button>
  );
};

export const DownloadButton = canDownloadProject ? Button : () => null;
