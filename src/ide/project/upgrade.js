export const currentVersion = 2;

export const newProject = () => {
  return {
    version: currentVersion,
    renderer: 'canvas',
    entities: [],
  };
};

export const upgradeProject = (project) => {
  if (!project.version) {
    project.version = 0;
  }

  if (project.version < 1) {
    project.renderer = 'canvas';
  }

  if (project.version < 2) {
    project.entities = [];
  }

  project.version = currentVersion;
};
