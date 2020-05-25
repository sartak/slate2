import React, { useState } from 'react';
import { PreviewContent } from './preview-content';

export const PreviewButton = ({ isBusy, preflight }) => {
  const [isPreviewing, setPreviewing] = useState(false);

  if (!isPreviewing) {
    return (
      <button disabled={isBusy} onClick={() => setPreviewing(true)}>Preview {preflight ? "Preflight" : "Build"}</button>
    );
  }

  const stopPreviewing = () => setPreviewing(false);

  return (
    <React.Fragment>
      <button onClick={stopPreviewing}>Close Preview</button>
      {isPreviewing && (
        <PreviewContent
          stopPreviewing={stopPreviewing}
          preflight={preflight}
        />
      )}
    </React.Fragment>
  );
};
