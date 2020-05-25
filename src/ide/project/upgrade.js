import { v4 as uuid } from 'uuid';

export const currentVersion = 20;

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

    build: {
      indexHtml: null,
      postbuild: null,
      webpackConfig: null,
    },

    ide: {
      tabs: {
        'panel-left': 'Entities',
      },
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

  if (project.version < 17) {
    Object.entries(project.entities).forEach(([id, entity]) => {
      if (id.match(/^\d+$/)) {
        const newId = `Entity${id}`;
        delete project.entities[id];
        entity.id = newId;
        project.entities[newId] = entity;

        if (String(project.activeEntityId) === id) {
          project.activeEntityId = newId;
        }
      }
    });

    Object.entries(project.userDefinedSystems).forEach(([id, system]) => {
      if (id.match(/^\d+$/)) {
        const newId = `System${id}`;
        delete project.userDefinedSystems[id];
        system.id = newId;
        project.userDefinedSystems[newId] = system;

        if (String(project.activeSystemId) === id) {
          project.activeSystemId = newId;
        }
      }
    });

    Object.entries(project.userDefinedComponents).forEach(([id, component]) => {
      if (id.match(/^\d+$/)) {
        const newId = `Component${id}`;
        delete project.userDefinedComponents[id];
        component.id = newId;
        project.userDefinedComponents[newId] = component;

        Object.values(project.userDefinedSystems).forEach((system) => {
          system.requiredComponents = system.requiredComponents.map((c) => String(c) === id ? newId : c);
        });

        Object.values(project.entities).forEach((entity) => {
          entity.componentIds = entity.componentIds.map((c) => String(c) === id ? newId : c);
          if (entity.componentConfig[id]) {
            entity.componentConfig[newId] = entity.componentConfig[id];
            delete entity.componentConfig[id];
          }
        });

        if (String(project.activeComponentId) === id) {
          project.activeComponentId = newId;
        }
      }
    });
  }

  if (project.version < 18) {
    project.ide = {
      tabs: {
        'panel-left': 'Entities',
      },
    };
  }

  if (project.version < 19) {
    project.build = {
      indexHtml: null,
      postbuild: null,
      webpackConfig: null,
    };
  }

  if (project.version < 20) {
    Object.entries(project.entities).forEach(([id, entity]) => {
      delete project.entities[id];
      project.entities[entity.id] = entity;

      if (String(project.activeEntityId) === id) {
        project.activeEntityId = entity.id;
      }
    });

    Object.entries(project.userDefinedSystems).forEach(([id, system]) => {
      delete project.userDefinedSystems[id];
      project.userDefinedSystems[system.id] = system;

      if (String(project.activeSystemId) === id) {
        project.activeSystemId = system.id;
      }
    });

    Object.entries(project.userDefinedComponents).forEach(([id, component]) => {
      console.log(component);
      delete project.userDefinedComponents[id];
      project.userDefinedComponents[component.id] = component;

      Object.values(project.userDefinedSystems).forEach((system) => {
        system.requiredComponents = system.requiredComponents.map((c) => String(c) === id ? component.id : c);
      });

      Object.values(project.entities).forEach((entity) => {
        entity.componentIds = entity.componentIds.map((c) => String(c) === id ? component.id : c);
        if (entity.componentConfig[id]) {
          const entityComponent = entity.componentConfig[id];
          delete entity.componentConfig[id];
          entity.componentConfig[component.id] = entityComponent;
          entityComponent.id = component.id;
        }
      });

      if (String(project.activeComponentId) === id) {
        project.activeComponentId = component.id;
      }
    });

    Object.values(project.userDefinedComponents).forEach((component) => {
      component.fields.forEach((field) => {
        const { id } = field;
        if (!String(id).match(/^\d+$/)) {
          return;
        }

        const newId = `field${id}`;
        field.id = newId;

        Object.values(project.entities).forEach((entity) => {
          const config = entity.componentConfig[component.id];
          if (config) {
            const fieldValue = config.values[id];
            delete config.values[id];
            config.values[newId] = fieldValue;
          }
        });
      });

    });
  }

  console.info(`Upgraded project from version ${project.version} to ${currentVersion}`);

  project.version = currentVersion;
};
