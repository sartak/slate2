const { ipcMain: ipc, shell } = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');

ipc.on('build-project', (event, project) => {
  const {sender} = event;

  makeTempDir().then((directory) => {
    saveFile(directory, 'game.js', project.code).then(() => {
      if (shell.openItem(directory)) {
        event.reply('build-project-success', directory);
      } else {
        event.reply('build-project-error', new Error(`Unable to open ${directory}`));
      }
    }).catch((err) => {
      event.reply('build-project-error', err);
    });
  }).catch((err) => {
    event.reply('build-project-error', err);
  });
});

const makeTempDir = () => {
  return new Promise((resolve, reject) => {
    const tmpDir = os.tmpdir();
    fs.mkdtemp(`${tmpDir}${path.sep}`, (err, directory) => {
      if (err) {
        reject(err);
      }
      resolve(directory);
    });
  });
};

const saveFile = (directory, filename, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(directory, filename), content, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};
