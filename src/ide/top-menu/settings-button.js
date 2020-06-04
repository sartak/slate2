import React, { useState } from 'react';
import { SettingsPanel } from '../settings';

export const SettingsButton = ({ isBusy, setBusy }) => {
  const [isOpen, setOpen] = useState(false);

  const openSettings = () => {
    setOpen(true);
    setBusy(true);
  };

  const closeSettings = () => {
    setOpen(false);
    setBusy(false);
  };

  if (!isOpen) {
    return (
      <button disabled={isBusy} onClick={openSettings}>Settings</button>
    );
  }

  return (
    <React.Fragment>
      <button onClick={closeSettings}>Close Settings</button>
      <SettingsPanel close={closeSettings} />
    </React.Fragment>
  );
};
