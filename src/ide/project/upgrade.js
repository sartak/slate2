import { v4 as uuid } from 'uuid';

export const currentVersion = 16;

export const newProject = () => {
  return {
    version: currentVersion,
    id: uuid(),
    renderer: 'canvas',
    preflightRunning: false,
    width: 800,
    height: 600,

    entities: {},
    nextEntityId: 1,
    activeEntityId: null,

    userDefinedSystems: {},
    nextUserDefinedSystemId: 1,
    activeSystemId: null,

    userDefinedComponents: {},
    nextUserDefinedComponentId: 1,
    activeComponentId: null,

    surface: {
      panX: 0,
      panY: 0,
      zoom: 1,
      prevZoom: 0.5,
    },
  };
};

export const upgradeProject = (project) => {
  if (project.version === currentVersion) {
    return;
  }

  if (project.version > currentVersion) {
    throw new Error(`Project has version ${project.version} but this version of slate2 can handle only up to ${currentVersion}`);
  }

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

  if (project.version < 13) {
    project.activeEntityIndex = project.selectedEntityIndex;
    delete project.selectedEntityIndex;
  }

  if (project.version < 14) {
    project.userDefinedSystems = {};
    project.nextUserDefinedSystemId = 1;
    project.activeSystemId = null;

    project.userDefinedComponents = {};
    project.nextUserDefinedComponentId = 1;
    project.activeComponentId = null;
  }

  if (project.version < 15) {
    const entities = {};
    let activeEntityId = null;

    project.entities.forEach((entity, i) => {
      entities[entity.id] = entity;
      if (project.activeEntityIndex === i) {
        activeEntityId = entity.id;
      }
    });

    project.entities = entities;
    project.activeEntityId = activeEntityId;
  }

  if (project.version < 16) {
    Object.values(project.entities).forEach((entity) => {
      entity.label = 'Entity';
    });
  }

  console.info(`Upgraded project from version ${project.version} to ${currentVersion}`);

  project.version = currentVersion;
};
