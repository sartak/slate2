export const currentVersion = 6;

export const newProject = () => {
  return {
    version: currentVersion,
    renderer: 'canvas',
    entities: [],
    nextEntityId: 1,
    selectedEntityIndex: -1,

    surface: {
      panX: 0,
      panY: 0,
      zoom: 1,
      prevZoom: 0.5,
    },
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

  if (project.version < 4) {
    project.selectedEntityIndex = -1;
  }

  if (project.version < 5) {
    project.surface = {
      panX: 0,
      panY: 0,
      zoom: 1,
      prevZoom: 0.5,
    };
  }

  if (project.version < 6) {
    project.entities.forEach((entity) => {
      entity.components = [];
    });
  }

  project.version = currentVersion;
};
