import React, { useState } from 'react';
import './index.less';
import { SaveButton } from './save-button';
import { DownloadButton } from './download-button';
import { BuildButton } from './build-button';
import { PreviewButton } from './preview-button';
import { PreflightButton } from './preflight-button';
import { ReplayButton } from './replay-button';
import { ReplayScrubber } from './replay-scrubber';
import { SettingsButton } from './settings-button';

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
      <ReplayButton isBusy={isBusy} setBusy={setBusy} />
      <ReplayScrubber />
      <SettingsButton isBusy={isBusy} setBusy={setBusy} />
    </div>
  );
};
