import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProject } from '../project/selectors';
import { FloatingEditor } from '../floating-editor';
import { assembleGame } from '../assemble/game';

export const PreviewButton = ({ isBusy }) => {
  const [isPreviewing, setPreviewing] = useState(false);
  const [previewCode, setPreviewCode] = useState('');
  const project = useSelector(selectProject);

  useEffect(() => {
    if (isPreviewing) {
      setPreviewCode(assembleGame(project));
    }
  }, [project, isPreviewing, assembleGame]);

  if (!isPreviewing) {
    return (
      <button disabled={isBusy} onClick={() => setPreviewing(true)}>Preview Build</button>
    );
  }
  else {
    return (
      <React.Fragment>
        <button onClick={() => setPreviewing(false)}>Close Preview</button>
        {isPreviewing && (
          <FloatingEditor
            close={() => setPreviewing(false)}
            language="javascript"
            value={previewCode}
            readOnly
          />
        )}
      </React.Fragment>
    );
  }
};
