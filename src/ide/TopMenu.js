import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveProject, canSaveProject, downloadProject, canDownloadProject, buildProject, canBuildProject } from '@ide/bridge';
import { startPreflightAction, stopPreflightAction } from './project';

export const TopMenu = () => {
  const [error, setError] = useState(null);

  const [isSaving, setSaving] = useState(false);
  const [isBuilding, setBuilding] = useState(false);

  const dispatch = useDispatch();
  const project = useSelector(project => project);
  const preflightRunning = useSelector(project => project.preflightRunning);

  const save = () => {
    setSaving(true);
    setError(null);

    saveProject(project).then((saved) => {
      setSaving(false);
    }).catch((err) => {
      setSaving(false);
      setError(err);
    });
  }

  const build = () => {
    setBuilding(true);
    setError(null);

    buildProject(project).then((directory) => {
      setBuilding(false);
    }).catch((err) => {
      setBuilding(false);
      setError(err);
    });
  }

  const download = () => {
    downloadProject(project);
  };

  const startPreflight = () => {
    dispatch(startPreflightAction());
  };

  const stopPreflight = () => {
    dispatch(stopPreflightAction());
  };

  return (
    <div className="TopMenu">
      {error && <div className="error-banner">{error.toString()}</div>}
      {canSaveProject && <button disabled={isSaving || isBuilding || preflightRunning} onClick={save}>Save Project</button>}
      {canDownloadProject && <button disabled={isSaving || isBuilding || preflightRunning} onClick={download}>Download Project</button>}
      {canBuildProject && <button disabled={isSaving || isBuilding || preflightRunning} onClick={build}>Build Project</button>}
      <button disabled={isSaving || isBuilding} onClick={preflightRunning ? stopPreflight : startPreflight}>{preflightRunning ? "Stop!" : "Run!"}</button>
    </div>
  );
};

