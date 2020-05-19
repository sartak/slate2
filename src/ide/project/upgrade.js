import { v4 as uuid } from 'uuid';

export const currentVersion = 12;

export const newProject = () => {
  return {
    version: currentVersion,
    id: uuid(),
    renderer: 'canvas',
    entities: [],
    nextEntityId: 1,
    selectedEntityIndex: -1,
    preflightRunning: false,
    width: 800,
    height: 600,

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
      entity.id = nextId++;
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

  if (project.version < 7) {
    project.entities.forEach((entity) => {
      entity.components = [
        {
          name: 'TransformComponent',
          fields: {
            parent: null,
            x: 0,
            y: 0,
            z: 0,
            rotation: 0,
            scale_x: 1,
            scale_y: 1,
          },
        },
        {
          name: 'RenderRectangleComponent',
          fields: {
            w: 100,
            h: 100,
            color: '#FFFFFF',
          },
        }
      ];
    });
  }

  if (project.version < 8) {
    project.entities.forEach((entity) => {
      entity.components.forEach((component) => {
        component.name = component.name.replace('Component', '');
      });
    });
  }

  if (project.version < 9) {
    project.id = uuid();
  }

  if (project.version < 10) {
    project.entities.forEach((entity) => {
      const componentIds = [];
      const componentConfig = {};

      entity.components.forEach((component) => {
        const { name, fields } = component;
        const id = `${name}Component`;
        componentIds.push(id);
        componentConfig[id] = { values: fields };
      });

      entity.componentIds = componentIds;
      entity.componentConfig = componentConfig;
      delete entity.components;
    });
  }

  if (project.version < 11) {
    project.entities.forEach((entity) => {
      entity.id = entity.__id;
      delete entity.__id;
    });
  }

  if (project.version < 12) {
    project.width = 800;
    project.height = 600;
  }

  project.version = currentVersion;
};
