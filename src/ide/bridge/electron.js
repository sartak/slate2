const { ipcRenderer: ipc } = require('electron');
import { defaultIndexHtml } from '../project';

const ipcRoundTrip = (name, {onSuccess, onError, onCancel, massageInput} = {}) => {
  let promiseResolve = null;
  let promiseReject = null;

  ipc.on(`${name}-success`, (event, ...response) => {
    if (!promiseResolve) {
      throw new Error(`Inconsistent state: got ${name}-success with no expected ${name}`);
    }

    const resolve = promiseResolve;
    promiseResolve = null;
    promiseReject = null;

    if (onSuccess) {
      onSuccess(resolve, ...response);
    } else {
      resolve(response[0]);
    }
  });

  ipc.on(`${name}-error`, (event, ...response) => {
    if (!promiseReject) {
      throw new Error(`Inconsistent state: got ${name}-error with no expected ${name}`);
    }

    const reject = promiseReject;
    promiseResolve = null;
    promiseReject = null;

    if (onError) {
      onError(reject, ...response);
    } else {
      reject(response[0]);
    }
  });

  if (onCancel) {
    ipc.on(`${name}-cancel`, (event, ...response) => {
      if (!promiseResolve) {
        throw new Error(`Inconsistent state: got ${name}-cancel with no expected ${name}`);
      }

      const resolve = promiseResolve;
      const reject = promiseReject;
      promiseResolve = null;
      promiseReject = null;

      onCancel(resolve, reject, ...response);
    });
  } else {
    ipc.on(`${name}-cancel`, () => {
      throw new Error(`Internal error: got ${name}-cancel with no onCancel configuration`);
    });
  }

  return (...args) => {
    if (promiseResolve || promiseReject) {
      throw new Error(`Inconsistent state: ${name} called before previous ${name} finished`);
    }

    return new Promise((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;

      if (massageInput) {
        ipc.send(name, ...massageInput(...args));
      } else {
        ipc.send(name, ...args);
      }
    });
  };
};

export const saveProject = ipcRoundTrip(
  'save-project',
  {
    onSuccess: (resolve) => resolve(true),
    onCancel: (resolve) => resolve(false),
  },
);

export const canSaveProject = true;

export const loadProject = ipcRoundTrip(
  'load-project',
  {
    onCancel: (resolve) => resolve(null),
  },
);

export const canLoadProject = true;

export const downloadProject = (project) => {
  throw new Error('Unable to download project in the app version of slate2. You can save the project file instead.');
};

export const canDownloadProject = false;

export const buildProject = ipcRoundTrip('build-project', {
  massageInput: (project) => {
    return [{
      indexHtml: defaultIndexHtml,
      ...project,
    }];
  },
});

export const canBuildProject = true;
