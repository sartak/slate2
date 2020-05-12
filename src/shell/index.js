const { app, BrowserWindow } = require('electron');
const path = require('path');
require('./files');
require('./build');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    backgroundColor: 'rgb(31, 31, 31)',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(IDE_WEBPACK_ENTRY);
};

app.allowRendererProcessReuse = true;

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
