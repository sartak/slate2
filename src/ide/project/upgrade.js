export const currentVersion = 1;

export const newProject = () => {
  return {
    version: currentVersion,
    renderer: 'canvas',
  };
};

export const upgradeProject = (project) => {
  if (!project.version) {
    project.version = 0;
  }

  if (project.version < 1) {
    project.renderer = 'canvas';
  }

  project.version = currentVersion;
};
