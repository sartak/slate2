import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProject } from '../project/selectors';
import { FloatingEditor } from '../floating-editor';
import { assembleGame } from '../assemble/game';

export const PreviewContent = ({ stopPreviewing }) => {
  const [previewCode, setPreviewCode] = useState('');
  const project = useSelector(selectProject);

  useEffect(() => {
    setPreviewCode(assembleGame(project));
  }, [project, assembleGame]);

  return (
    <FloatingEditor
      close={stopPreviewing}
      language="javascript"
      value={previewCode}
      readOnly
    />
  );
};
