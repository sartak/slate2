import { newProject } from './upgrade';

export const CREATE_PROJECT = 'CREATE_PROJECT';
export const LOAD_PROJECT = 'LOAD_PROJECT';
export const SET_RENDERER = 'SET_RENDERER';
export const ADD_ENTITY = 'ADD_ENTITY';
export const SET_ACTIVE_ENTITY = 'SET_ACTIVE_ENTITY';
export const COMMIT_SURFACE_TRANSFORM = 'COMMIT_SURFACE_TRANSFORM';
export const CHANGE_ENTITY_COMPONENT_VALUE = 'CHANGE_ENTITY_COMPONENT_VALUE';
export const ADD_COMPONENT_TO_ENTITY = 'ADD_COMPONENT_TO_ENTITY';
export const PREFLIGHT_RUNNING = 'PREFLIGHT_RUNNING';
export const ADD_USER_DEFINED_SYSTEM = 'ADD_USER_DEFINED_SYSTEM';
export const SET_ACTIVE_SYSTEM = 'SET_ACTIVE_SYSTEM';
export const ADD_USER_DEFINED_COMPONENT = 'ADD_USER_DEFINED_COMPONENT';
export const SET_ACTIVE_COMPONENT = 'SET_ACTIVE_COMPONENT';
export const SET_ENTITY_LABEL = 'SET_ENTITY_LABEL';
export const SET_USER_DEFINED_COMPONENT_LABEL = 'SET_USER_DEFINED_COMPONENT_LABEL';
export const SET_USER_DEFINED_SYSTEM_LABEL = 'SET_USER_DEFINED_SYSTEM_LABEL';
export const ADD_FIELD_TO_USER_DEFINED_COMPONENT = 'ADD_FIELD_TO_USER_DEFINED_COMPONENT';
export const SET_USER_DEFINED_COMPONENT_FIELD_METADATA = 'SET_USER_DEFINED_COMPONENT_FIELD_METADATA';
export const SET_CODE_FOR_USER_DEFINED_SYSTEM_METHOD = 'SET_CODE_FOR_USER_DEFINED_SYSTEM_METHOD';
export const ADD_REQUIRED_COMPONENT_TO_USER_DEFINED_SYSTEM = 'ADD_REQUIRED_COMPONENT_TO_USER_DEFINED_SYSTEM';
export const REMOVE_REQUIRED_COMPONENT_FROM_USER_DEFINED_SYSTEM = 'REMOVE_REQUIRED_COMPONENT_FROM_USER_DEFINED_SYSTEM';
export const SET_SELECTED_TAB_LABEL = 'SET_SELECTED_TAB_LABEL';
export const SET_BUILD_OPTION = 'SET_BUILD_OPTION';
export const ADD_COMMAND = 'ADD_COMMAND';
export const REMOVE_COMMAND = 'REMOVE_COMMAND';
export const ADD_KEY_FOR_COMMAND = 'ADD_KEY_FOR_COMMAND';
export const REMOVE_KEY_FOR_COMMAND = 'REMOVE_KEY_FOR_COMMAND';
export const SET_LABEL_FOR_COMMAND = 'SET_LABEL_FOR_COMMAND';
export const ADD_RECORDING = 'ADD_RECORDING';

export const projectReducer = (state = null, action) => {
  switch (action.type) {
    case CREATE_PROJECT: {
      return newProject();
    }

    case LOAD_PROJECT: {
      return action.project;
    }

    case SET_RENDERER: {
      return {
        ...state,
        renderer: action.renderer,
      };
    }

    case ADD_ENTITY: {
      const { nextEntityId, entities } = state;
      const id = `Entity${nextEntityId}`;

      return {
        ...state,
        nextEntityId: 1 + nextEntityId,
        entities: {
          ...entities,
          [id]: {
            ...action.entity,
            id,
            label: id,
          },
        },

        activeEntityId: id,
        activeComponentId: null,
        activeSystemId: null,

        ide: {
          ...state.ide,
          tabs: {
            ...state.ide.tabs,
            'panel-left': 'Entities',
          },
        },
      };
    }

    case SET_ACTIVE_ENTITY: {
      return {
        ...state,
        activeEntityId: action.id,
        activeComponentId: null,
        activeSystemId: null,

        ide: {
          ...state.ide,
          tabs: {
            ...state.ide.tabs,
            'panel-left': 'Entities',
          },
        },
      };
    }

    case SET_ACTIVE_SYSTEM: {
      return {
        ...state,
        activeEntityId: null,
        activeComponentId: null,
        activeSystemId: action.id,

        ide: {
          ...state.ide,
          tabs: {
            ...state.ide.tabs,
            'panel-left': 'Systems',
          },
        },
      };
    }

    case SET_ACTIVE_COMPONENT: {
      return {
        ...state,
        activeEntityId: null,
        activeComponentId: action.id,
        activeSystemId: null,

        ide: {
          ...state.ide,
          tabs: {
            ...state.ide.tabs,
            'panel-left': 'Components',
          },
        },
      };
    }

    case COMMIT_SURFACE_TRANSFORM: {
      return {
        ...state,
        surface: action.surface,
      };
    }

    case CHANGE_ENTITY_COMPONENT_VALUE: {
      const { entityId, componentId, fieldId, value } = action;
      const { entities } = state;
      const entity = entities[entityId];
      const { componentConfig } = entity;
      const { values } = componentConfig[componentId];

      return {
        ...state,
        entities: {
          ...entities,
          [entityId]: {
            ...entity,
            componentConfig: {
              ...componentConfig,
              [componentId]: {
                ...componentConfig[componentId],
                values: {
                  ...values,
                  [fieldId]: value,
                },
              },
            },
          },
        },
      };
    }

    case ADD_COMPONENT_TO_ENTITY: {
      const { id: entityId, entityComponent } = action;
      const { id: entityComponentId } = entityComponent;
      const { entities } = state;
      const entity = entities[entityId];
      const { componentIds, componentConfig } = entity;

      return {
        ...state,
        entities: {
          ...entities,
          [entityId]: {
            ...entity,
            componentIds: [...componentIds, entityComponentId],
            componentConfig: {
              ...componentConfig,
              [entityComponentId]: entityComponent,
            },
          },
        },
      };
    }

    case PREFLIGHT_RUNNING: {
      return {
        ...state,
        preflightRunning: action.preflightRunning,
        preflightReplay: action.preflightReplay,
      };
    }

    case ADD_USER_DEFINED_SYSTEM: {
      const { nextUserDefinedSystemId, userDefinedSystems } = state;
      const id = `System${nextUserDefinedSystemId}`;

      return {
        ...state,
        nextUserDefinedSystemId: 1 + nextUserDefinedSystemId,
        userDefinedSystems: {
          ...userDefinedSystems,
          [id]: {
            ...action.system,
            id,
            label: id,
          },
        },

        activeEntityId: null,
        activeSystemId: id,
        activeComponentId: null,

        ide: {
          ...state.ide,
          tabs: {
            ...state.ide.tabs,
            'panel-left': 'Systems',
          },
        },
      };
    }

    case ADD_USER_DEFINED_COMPONENT: {
      const { nextUserDefinedComponentId, userDefinedComponents } = state;
      const id = `Component${nextUserDefinedComponentId}`;

      return {
        ...state,
        nextUserDefinedComponentId: 1 + nextUserDefinedComponentId,
        userDefinedComponents: {
          ...userDefinedComponents,
          [id]: {
            ...action.component,
            id,
            label: id,
          },
        },

        activeEntityId: null,
        activeSystemId: null,
        activeComponentId: id,

        ide: {
          ...state.ide,
          tabs: {
            ...state.ide.tabs,
            'panel-left': 'Components',
          },
        },
      };
    }

    case SET_ENTITY_LABEL: {
      const { id, label } = action;
      const { entities } = state;
      const entity = entities[id];

      return {
        ...state,
        entities: {
          ...entities,
          [id]: {
            ...entity,
            label,
          },
        },
      };
    }

    case SET_USER_DEFINED_COMPONENT_LABEL: {
      const { id, label } = action;
      const { userDefinedComponents } = state;
      const component = userDefinedComponents[id];

      return {
        ...state,
        userDefinedComponents: {
          ...userDefinedComponents,
          [id]: {
            ...component,
            label,
          },
        },
      };
    }

    case SET_USER_DEFINED_SYSTEM_LABEL: {
      const { id, label } = action;
      const { userDefinedSystems } = state;
      const system = userDefinedSystems[id];

      return {
        ...state,
        userDefinedSystems: {
          ...userDefinedSystems,
          [id]: {
            ...system,
            label,
          },
        },
      };
    }

    case ADD_FIELD_TO_USER_DEFINED_COMPONENT: {
      const { id: componentId, field } = action;
      const { userDefinedComponents } = state;
      const component = userDefinedComponents[componentId];
      const { fields, nextFieldId } = component;
      const fieldId = `field${nextFieldId}`;

      return {
        ...state,
        userDefinedComponents: {
          ...userDefinedComponents,
          [componentId]: {
            ...component,
            nextFieldId: 1 + nextFieldId,
            fields: [
              ...fields,
              {
                ...field,
                id: fieldId,
                label: fieldId,
              },
            ],
          },
        },
      };
    }

    case SET_USER_DEFINED_COMPONENT_FIELD_METADATA: {
      const { componentId, fieldId, key, value } = action;
      const { userDefinedComponents } = state;
      const component = userDefinedComponents[componentId];
      const { fields } = component;

      return {
        ...state,
        userDefinedComponents: {
          ...userDefinedComponents,
          [componentId]: {
            ...component,
            fields: fields.map((field) => field.id !== fieldId ? field : {
              ...field,
              [key]: value,
            }),
          },
        },
      };
    }

    case SET_CODE_FOR_USER_DEFINED_SYSTEM_METHOD: {
      const { id, method, code } = action;
      const { userDefinedSystems } = state;
      const system = userDefinedSystems[id];
      const { methods } = system;

      return {
        ...state,
        userDefinedSystems: {
          ...userDefinedSystems,
          [id]: {
            ...system,
            methods: {
              ...methods,
              [method]: code,
            },
          },
        },
      };
    }

    case ADD_REQUIRED_COMPONENT_TO_USER_DEFINED_SYSTEM: {
      const { systemId, componentId } = action;
      const { userDefinedSystems } = state;
      const system = userDefinedSystems[systemId];
      const { requiredComponents } = system;

      return {
        ...state,
        userDefinedSystems: {
          ...userDefinedSystems,
          [systemId]: {
            ...system,
            requiredComponents: [...requiredComponents, componentId],
          },
        },
      };
    }

    case REMOVE_REQUIRED_COMPONENT_FROM_USER_DEFINED_SYSTEM: {
      const { systemId, componentId } = action;
      const { userDefinedSystems } = state;
      const system = userDefinedSystems[systemId];
      const { requiredComponents } = system;

      return {
        ...state,
        userDefinedSystems: {
          ...userDefinedSystems,
          [systemId]: {
            ...system,
            requiredComponents: requiredComponents.filter((id) => id !== componentId),
          },
        },
      };
    }

    case SET_SELECTED_TAB_LABEL: {
      const { id, label } = action;
      const { ide } = state;
      const { tabs } = ide;

      return {
        ...state,
        ide: {
          ...ide,
          tabs: {
            ...tabs,
            [id]: label,
          },
        },
      };
    }

    case SET_BUILD_OPTION: {
      const { key, value } = action;
      const { build } = state;

      return {
        ...state,
        build: {
          ...build,
          [key]: value,
        },
      };
    }

    case ADD_COMMAND: {
      const { nextCommandId, commands } = state;
      const id = `command${nextCommandId}`;

      return {
        ...state,
        nextCommandId: 1 + nextCommandId,
        commands: {
          ...commands,
          [id]: {
            id,
            label: id,
            keys: [],
          },
        },
      };
    }

    case REMOVE_COMMAND: {
      const { id } = action;
      const { commands } = state;
      const newCommands = { ...commands };
      delete newCommands[id];

      return {
        ...state,
        commands: newCommands,
      };
    }

    case ADD_KEY_FOR_COMMAND: {
      const { id, key } = action;
      const { commands } = state;
      const command = commands[id];
      const { keys } = command;

      return {
        ...state,
        commands: {
          ...commands,
          [id]: {
            ...command,
            keys: [...keys, key],
          },
        },
      };
    }

    case REMOVE_KEY_FOR_COMMAND: {
      const { id, key } = action;
      const { commands } = state;
      const command = commands[id];
      const { keys } = command;

      return {
        ...state,
        commands: {
          ...commands,
          [id]: {
            ...command,
            keys: keys.filter((k) => k !== key),
          },
        },
      };
    }

    case SET_LABEL_FOR_COMMAND: {
      const { id, label } = action;
      const { commands } = state;
      const command = commands[id];

      return {
        ...state,
        commands: {
          ...commands,
          [id]: {
            ...command,
            label,
          },
        },
      };
    }

    case ADD_RECORDING: {
      const { recording } = action;
      const { recordings } = state;

      return {
        ...state,
        recordings: [...recordings, recording],
      };
    }

    default: {
      return state;
    }
  }
};
