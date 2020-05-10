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

ipc.on('load-project', (event) => {
  const {sender} = event;

  dialog.showOpenDialog(sender, {
    filters: [
      { name: 'slate2 Project', extensions: ['s2p'] },
    ],
    properties: {
      openFile: true,
      openDirectory: false,
      multiSelections: true,
      showHiddenFiles: false,
      promptToCreate: true,
    },
  }).then(({canceled, filePaths}) => {
    if (canceled || filePaths.length === 0) {
      event.reply('load-project-cancel');
    }
    else {
      const [filePath] = filePaths;
      currentProjectFileForWindow.set(sender, filePath);
      loadProject(filePath).then((project) => {
        event.reply('load-project-success', project);
      }).catch((err) => {
        event.reply('load-project-error', err);
      });
    }
  });
});

const saveProject = (project, filename) => {
  const data = JSON.stringify(project);

  // @Performance: this can be made asynchronous, though we'll want to
  // serialize concurrent saves
  fs.writeFileSync(filename, data);
};

const loadProject = (filename) => {
  return new Promise((resolve, reject) => {
    // @Compatibility: Windows can specify a nonexistent file here, which
    // we should use as a signal to create the file rather than loading it.
    fs.readFile(filename, (err, data) => {
      if (err) {
        return reject(err);
      }

      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(`Cannot load ${filename}: ${e.toString()}`);
      }
    });
  });
};
