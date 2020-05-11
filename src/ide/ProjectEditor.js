import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CodeEditor } from './CodeEditor';
import { saveProject, canSaveProject, downloadProject, canDownloadProject, buildProject, canBuildProject } from '@ide/bridge';

export const ProjectEditor = () => {
  const [error, setError] = useState(null);

  const [isSaving, setSaving] = useState(false);
  const [isBuilding, setBuilding] = useState(false);

  const dispatch = useDispatch();
  const project = useSelector(project => project);
  const code = useSelector(project => project.code);

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

  return (
    <div className="ProjectEditor" style={{padding: 20}}>
      {error && <div className="error-banner">{error.toString()}</div>}
      <CodeEditor
        width="400"
        height="300"
        language="javascript"
        value={code}
        onChange={(code) => dispatch({type: 'change-code', code})}
      />
      {canSaveProject && <button disabled={isSaving || isBuilding} onClick={save}>Save Project</button>}
      {canDownloadProject && <button disabled={isSaving || isBuilding} onClick={download}>Download Project</button>}
      {canBuildProject && <button disabled={isSaving || isBuilding} onClick={build}>Build Project</button>}
    </div>
  );
};
