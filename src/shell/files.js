const { app, dialog, ipcMain: ipc } = require('electron');
const fs = require('fs');

const currentProjectFileForWindow = new WeakMap();

const projectFilters = [
  { name: 'slate2 Project', extensions: ['s2p'] },
];

ipc.on('save-project', (event, project) => {
  const {sender} = event;
  const name = currentProjectFileForWindow.get(event.sender);

  if (name === undefined) {
    dialog.showSaveDialog({
      defaultPath: 'project.s2p',
      filters: projectFilters,
    }).then(({canceled, filePath}) => {
      if (canceled) {
        event.reply('save-project-cancel');
        return;
      }
      currentProjectFileForWindow.set(sender, filePath);
      saveProject(project, filePath).then(() => {
        event.reply('save-project-success');
      }).catch((err) => {
        event.reply('save-project-error', err);
      });
    });
  }
  else {
    saveProject(project, name).then(() => {
      event.reply('save-project-success');
    }).catch((err) => {
      event.reply('save-project-error', err);
    });
  }
});

ipc.on('load-project', (event) => {
  const {sender} = event;

  dialog.showOpenDialog(sender, {
    filters: projectFilters,
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
  app.addRecentDocument(filename);

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(project);
    fs.writeFile(filename, data, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const loadProject = (filename) => {
  app.addRecentDocument(filename);

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
