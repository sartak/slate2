export const saveProject = (project) => {
  return Promise.reject(new Error('Unable to save project in the web version of slate2. You can download the project file instead.'));
};

export const canSaveProject = false;

export const loadProject = () => {
  return Promise.resolve({});
};

export const canLoadProject = false;

export const downloadProject = (project) => {
  const element = document.createElement('a');
  const text = JSON.stringify(project);
  element.setAttribute('href', 'data:application/slate2-project;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', 'project.s2p');
  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export const canDownloadProject = true;

export const buildProject = (project) => {
  return Promise.reject(new Error('Unable to build project in the web version of slate2. You can download the project file then build using the app version of slate2 instead.'));
};

export const canBuildProject = false;
