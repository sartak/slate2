import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectProject } from '../project/selectors';
import { assembleGame } from '../assemble/game';
import { useFloatingEditor } from '../code-editor';
import { usePreflight } from '../preflight';

export const PreviewContent = ({ stopPreviewing, isPreflight }) => {
  const edit = useFloatingEditor();
  const project = useSelector(selectProject);
  const preflight = usePreflight();

  useEffect(() => {
    const code = isPreflight ? preflight.assembly?.code : assembleGame(project);
    const closeEditor = edit(
      code,
      isPreflight ? "preflight" : "build",
      {
        close: stopPreviewing,
        language: "javascript",
        readOnly: true,
      },
    );

    return () => {
      closeEditor();
    };
  }, [project, isPreflight, isPreflight ? preflight.assembly?.code : assembleGame]);

  return <React.Fragment />;
};
