export const currentVersion = 3;

export const newProject = () => {
  return {
    version: currentVersion,
    renderer: 'canvas',
    entities: [],
    nextEntityId: 1,
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

  if (project.version < 3) {
    let nextId = 1;
    project.entities.forEach((entity) => {
      entity.__id = nextId++;
    });
    project.nextEntityId = nextId;
  }

  project.version = currentVersion;
};
