import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectProject } from '../project/selectors';
import { assembleGame } from '../assemble/game';
import { assembleGameForPreflight } from '../assemble/preflight';
import { useFloatingEditor } from '../code-editor';

export const PreviewContent = ({ stopPreviewing, preflight }) => {
  const edit = useFloatingEditor();
  const project = useSelector(selectProject);

  useEffect(() => {
    const code = preflight ? assembleGameForPreflight(project)[0] : assembleGame(project);
    const closeEditor = edit(
      code,
      preflight ? "preflight" : "build",
      {
        close: stopPreviewing,
        language: "javascript",
        readOnly: true,
      },
    );

    return () => {
      closeEditor();
    };
  }, [project, preflight, preflight ? assembleGameForPreflight : assembleGame]);

  return <React.Fragment />;
};
