const { dialog, ipcMain: ipc } = require('electron');
const fs = require('fs');

const currentProjectFileForWindow = new WeakMap();

ipc.on('save-project', (event, project) => {
  const {sender} = event;
  const name = currentProjectFileForWindow.get(event.sender);

  if (name === undefined) {
    dialog.showSaveDialog({
      defaultPath: 'project.s2p',
      filters: [
        { name: 'slate2 Project', extensions: ['s2p'] },
      ],
    }).then(({canceled, filePath}) => {
      if (canceled) {
        return;
      }
      currentProjectFileForWindow.set(sender, filePath);
      saveProject(project, filePath);
    });
  }
  else {
    saveProject(project, name);
  }
});

const saveProject = (project, filename) => {
  const data = JSON.stringify(project);

  // @Performance: this can be made asynchronous, though we'll want to
  // serialize concurrent saves
  fs.writeFileSync(filename, data);
};
