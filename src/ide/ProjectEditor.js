import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CodeEditor } from './CodeEditor';
import { Surface } from './Surface';
import { saveProject, canSaveProject, downloadProject, canDownloadProject, buildProject, canBuildProject } from '@ide/bridge';

export const ProjectEditor = () => {
  const [error, setError] = useState(null);

  const [isSaving, setSaving] = useState(false);
  const [isBuilding, setBuilding] = useState(false);

  const dispatch = useDispatch();
  const project = useSelector(project => project);
  const code = useSelector(project => project.code);
  const renderer = useSelector(project => project.renderer);

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
      <select value={renderer} onChange={(e) => dispatch({type: 'set-renderer', renderer: e.target.value})}>
        <option value="canvas">Canvas</option>
        <option value="webgl">WebGL</option>
        <option value="webgpu">WebGPU (experimental)</option>
      </select>
      {canSaveProject && <button disabled={isSaving || isBuilding} onClick={save}>Save Project</button>}
      {canDownloadProject && <button disabled={isSaving || isBuilding} onClick={download}>Download Project</button>}
      {canBuildProject && <button disabled={isSaving || isBuilding} onClick={build}>Build Project</button>}
      <Surface />
    </div>
  );
};
