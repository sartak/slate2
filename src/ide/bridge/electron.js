const { ipcRenderer: ipc } = require('electron');

export const saveProject = (project) => {
  ipc.send('save-project', project);
};

let loadPromiseResolve = null;
let loadPromiseReject = null;
export const loadProject = (project) => {
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
