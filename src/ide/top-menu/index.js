import React, { useState } from 'react';
import { SaveButton } from './save-button';
import { DownloadButton } from './download-button';
import { BuildButton } from './build-button';
import { PreviewButton } from './preview-button';
import { PreflightButton } from './preflight-button';

export const TopMenu = () => {
  const [isBusy, setBusy] = useState(false);

  return (
    <div className="TopMenu">
      <SaveButton isBusy={isBusy} setBusy={setBusy} />
      <DownloadButton isBusy={isBusy} setBusy={setBusy} />
      <BuildButton isBusy={isBusy} setBusy={setBusy} />
      <PreviewButton isBusy={isBusy} setBusy={setBusy} />
      <PreviewButton isBusy={isBusy} setBusy={setBusy} isPreflight />
      <PreflightButton isBusy={isBusy} setBusy={setBusy} />
    </div>
  );
};
