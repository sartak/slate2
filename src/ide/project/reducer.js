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
      const { nextEntityId: id } = state;

      return {
        ...state,
        nextEntityId: 1 + id,
        entities: {
          ...state.entities,
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
      const entity = state.entities[entityId];
      const { componentConfig } = entity;
      const { values } = componentConfig[componentId];

      return {
        ...state,
        entities: {
          ...state.entities,
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
      const entity = state.entities[entityId];
      const { componentIds, componentConfig } = entity;

      return {
        ...state,
        entities: {
          ...state.entities,
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
      const { nextUserDefinedSystemId: id } = state;

      return {
        ...state,
        nextUserDefinedSystemId: 1 + id,
        userDefinedSystems: {
          ...state.userDefinedSystems,
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
      const { nextUserDefinedComponentId: id } = state;

      return {
        ...state,
        nextUserDefinedComponentId: 1 + id,
        userDefinedComponents: {
          ...state.userDefinedComponents,
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
      const entity = state.entities[id];

      return {
        ...state,
        entities: {
          ...state.entities,
          [id]: {
            ...entity,
            label,
          },
        },
      };
    }

    default: {
      return state;
    }
  }
};
