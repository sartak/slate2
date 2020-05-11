const { ipcRenderer: ipc } = require('electron');

// @Refactor: there's clearly duplication between how saving and loading
// manage events and promises

let savePromiseResolve = null;
let savePromiseReject = null;
export const saveProject = (project) => {
  if (savePromiseResolve || savePromiseReject) {
    throw new Error('Inconsistent state: saveProject called before previous saveProject finished');
  }

  const savePromise = new Promise((resolve, reject) => {
    savePromiseResolve = resolve;
    savePromiseReject = reject;
    ipc.send('save-project', project);
  });

  return savePromise;
};

ipc.on('save-project-success', (event, project) => {
  if (!savePromiseResolve) {
    throw new Error('Inconsistent state: got save-project-success with no expected saveProject');
  }

  const resolve = savePromiseResolve;
  savePromiseResolve = null;
  savePromiseReject = null;

  resolve(true);
});

ipc.on('save-project-error', (event, err) => {
  if (!savePromiseReject) {
    throw new Error('Inconsistent state: got save-project-error with no expected saveProject');
  }

  const reject = savePromiseReject;
  savePromiseResolve = null;
  savePromiseReject = null;

  reject(err);
});

ipc.on('save-project-cancel', (event) => {
  if (!savePromiseResolve) {
    throw new Error('Inconsistent state: got save-project-cancel with no expected saveProject');
  }

  const resolve = savePromiseResolve;
  savePromiseResolve = null;
  savePromiseReject = null;

  resolve(false);
});

export const canSaveProject = true;

let loadPromiseResolve = null;
let loadPromiseReject = null;
export const loadProject = () => {
  if (loadPromiseResolve || loadPromiseReject) {
    throw new Error('Inconsistent state: loadProject called before previous loadProject finished');
  }

  const loadPromise = new Promise((resolve, reject) => {
    loadPromiseResolve = resolve;
    loadPromiseReject = reject;
    ipc.send('load-project');
  });

  return loadPromise;
};

ipc.on('load-project-success', (event, project) => {
  if (!loadPromiseResolve) {
    throw new Error('Inconsistent state: got load-project-success with no expected loadProject');
  }

  const resolve = loadPromiseResolve;
  loadPromiseResolve = null;
  loadPromiseReject = null;

  resolve(project);
});

ipc.on('load-project-error', (event, err) => {
  if (!loadPromiseReject) {
    throw new Error('Inconsistent state: got load-project-error with no expected loadProject');
  }

  const reject = loadPromiseReject;
  loadPromiseResolve = null;
  loadPromiseReject = null;

  reject(err);
});

ipc.on('load-project-cancel', (event) => {
  if (!loadPromiseResolve) {
    throw new Error('Inconsistent state: got load-project-cancel with no expected loadProject');
  }

  const resolve = loadPromiseResolve;
  loadPromiseResolve = null;
  loadPromiseReject = null;

  resolve(null);
});

export const canLoadProject = true;
