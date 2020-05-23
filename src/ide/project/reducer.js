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
      const { nextEntityId: id, entities } = state;

      return {
        ...state,
        nextEntityId: 1 + id,
        entities: {
          ...entities,
          [id]: {
            ...action.entity,
            id,
            label: `Entity${id}`,
          },
        },

        activeEntityId: id,
        activeComponentId: null,
        activeSystemId: null,
      };
    }

    case SET_ACTIVE_ENTITY: {
      return {
        ...state,
        activeEntityId: action.id,
        activeComponentId: null,
        activeSystemId: null,
      };
    }

    case SET_ACTIVE_SYSTEM: {
      return {
        ...state,
        activeEntityId: null,
        activeComponentId: null,
        activeSystemId: action.id,
      };
    }

    case SET_ACTIVE_COMPONENT: {
      return {
        ...state,
        activeEntityId: null,
        activeComponentId: action.id,
        activeSystemId: null,
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
      };
    }

    case ADD_USER_DEFINED_SYSTEM: {
      const { nextUserDefinedSystemId: id, userDefinedSystems } = state;

      return {
        ...state,
        nextUserDefinedSystemId: 1 + id,
        userDefinedSystems: {
          ...userDefinedSystems,
          [id]: {
            ...action.system,
            id,
            label: `System${id}`,
          },
        },

        activeEntityId: null,
        activeSystemId: id,
        activeComponentId: null,
      };
    }

    case ADD_USER_DEFINED_COMPONENT: {
      const { nextUserDefinedComponentId: id, userDefinedComponents } = state;

      return {
        ...state,
        nextUserDefinedComponentId: 1 + id,
        userDefinedComponents: {
          ...userDefinedComponents,
          [id]: {
            ...action.component,
            id,
            label: `Component${id}`,
          },
        },

        activeEntityId: null,
        activeSystemId: null,
        activeComponentId: id,
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
      const { fields, nextFieldId: fieldId } = component;

      return {
        ...state,
        userDefinedComponents: {
          ...userDefinedComponents,
          [componentId]: {
            ...component,
            nextFieldId: 1 + fieldId,
            fields: [
              ...fields,
              {
                ...field,
                id: fieldId,
                label: `field${fieldId}`,
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

    default: {
      return state;
    }
  }
};
