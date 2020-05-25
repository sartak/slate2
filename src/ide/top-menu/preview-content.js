import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectProject } from '../project/selectors';
import { assembleGame } from '../assemble/game';
import { useFloatingEditor } from '../code-editor';

export const PreviewContent = ({ stopPreviewing }) => {
  const edit = useFloatingEditor();
  const project = useSelector(selectProject);

  useEffect(() => {
    const closeEditor = edit(
      assembleGame(project),
      "preview",
      {
        close: stopPreviewing,
        language: "javascript",
        readOnly: true,
      },
    );

    return () => {
      closeEditor();
    };
  }, [project, assembleGame]);

  return <React.Fragment />;
};
