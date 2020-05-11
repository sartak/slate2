export const saveProject = (project) => {
  return Promise.reject(new Error('Unable to save project in the web version of slate2. You can still export the project file.'));
};

export const canSaveProject = false;

export const loadProject = () => {
  return Promise.resolve({});
};

export const canLoadProject = false;
