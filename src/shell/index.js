const { app, BrowserWindow } = require('electron');
const os = require('os');
const path = require('path');
require('./files');
require('./build');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // React Developer Tools
  /*
    BrowserWindow.addDevToolsExtension(
      path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.7.0_0')
    )
  */

  // Redux Developer Tools
  /*
    BrowserWindow.addDevToolsExtension(
      path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0')
    )
  */

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
