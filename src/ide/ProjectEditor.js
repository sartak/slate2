import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CodeEditor } from './CodeEditor';
import { saveProject, canSaveProject } from '@ide/bridge';

export const ProjectEditor = () => {
  const [error, setError] = useState(null);

  const [isSaving, setSaving] = useState(false);

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
      {canSaveProject && <button disabled={isSaving} onClick={save}>Save Project</button>}
    </div>
  );
};
