import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveProject, canSaveProject, downloadProject, canDownloadProject, buildProject, canBuildProject } from '@ide/bridge';
import { preflightRunningAction } from './project/actions';
import { FloatingEditor } from './floating-editor';
import { assembleGame } from './assemble/game';
import { selectProject, selectPreflightRunning } from './project/selectors';
import { useAlert } from './alert';

export const TopMenu = () => {
  const alert = useAlert();
  const [isSaving, setSaving] = useState(false);
  const [isBuilding, setBuilding] = useState(false);

  const dispatch = useDispatch();
  const project = useSelector(selectProject);
  const preflightRunning = useSelector(selectPreflightRunning);
  const [isPreview, setPreview] = useState(false);
  const [previewCode, setPreviewCode] = useState('');

  useEffect(() => {
    if (isPreview) {
      setPreviewCode(assembleGame(project));
    }
  }, [project, isPreview, assembleGame]);

  const save = () => {
    setSaving(true);
    alert.dismissCategory('save-project');

    saveProject(project).then((saved) => {
      setSaving(false);
    }).catch((err) => {
      setSaving(false);
      alert.error(err, { category: 'save-project' });
    });
  }

  const build = () => {
    setBuilding(true);
    alert.dismissCategory('build-project');

    buildProject(project).then((directory) => {
      setBuilding(false);
    }).catch((err) => {
      setBuilding(false);
      alert.error(err, { category: 'build-project' });
    });
  }

  const download = () => {
    downloadProject(project);
  };

  const startPreflight = () => {
    dispatch(preflightRunningAction(true));
  };

  const stopPreflight = () => {
    dispatch(preflightRunningAction(false));
  };

  return (
    <div className="TopMenu">
      {canSaveProject && <button disabled={isSaving || isBuilding || preflightRunning} onClick={save}>Save Project</button>}
      {canDownloadProject && <button disabled={isSaving || isBuilding || preflightRunning} onClick={download}>Download Project</button>}
      {canBuildProject && <button disabled={isSaving || isBuilding || preflightRunning} onClick={build}>Build Project</button>}
      <button disabled={isSaving || isBuilding || preflightRunning} onClick={() => setPreview(true)}>[Preview Build]</button>
      <button disabled={isSaving || isBuilding} onClick={preflightRunning ? stopPreflight : startPreflight}>{preflightRunning ? "Stop!" : "Run!"}</button>

      {isPreview && (
        <FloatingEditor
          close={() => setPreview(false)}
          language="javascript"
          value={previewCode}
          readOnly
        />
      )}
    </div>
  );
};

