const { ipcRenderer: ipc } = require('electron');

export const saveProject = (project) => {
  ipc.send('save-project', project);
};

