import { newProject } from './upgrade';

export const CREATE_PROJECT = 'CREATE_PROJECT';
export const LOAD_PROJECT = 'LOAD_PROJECT';
export const SET_RENDERER = 'SET_RENDERER';
export const ADD_ENTITY = 'ADD_ENTITY';
export const SET_ACTIVE_ENTITY_INDEX = 'SET_ACTIVE_ENTITY_INDEX';
export const COMMIT_SURFACE_TRANSFORM = 'COMMIT_SURFACE_TRANSFORM';
export const CHANGE_ENTITY_COMPONENT_VALUE = 'CHANGE_ENTITY_COMPONENT_VALUE';
export const ADD_COMPONENT_TO_ENTITY = 'ADD_COMPONENT_TO_ENTITY';
export const PREFLIGHT_RUNNING = 'PREFLIGHT_RUNNING';
export const ADD_USER_DEFINED_SYSTEM = 'ADD_USER_DEFINED_SYSTEM';
export const ADD_USER_DEFINED_COMPONENT = 'ADD_USER_DEFINED_COMPONENT';

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
      return {
        ...state,
        nextEntityId: 1 + state.nextEntityId,
        activeEntityIndex: state.entities.length,
        entities: [
          ...state.entities,
          { ...action.entity, id: state.nextEntityId },
        ],
      };
    }

    case SET_ACTIVE_ENTITY_INDEX: {
      return {
        ...state,
        activeEntityIndex: action.index,
      };
    }

    case COMMIT_SURFACE_TRANSFORM: {
      return {
        ...state,
        surface: action.surface,
      };
    }

    case CHANGE_ENTITY_COMPONENT_VALUE: {
      const {entityIndex, componentId, fieldId, value} = action;

      return {
        ...state,
        entities: state.entities.map((entity, i) => {
          if (i !== entityIndex) {
            return entity;
          }
          return {
            ...entity,
            componentConfig: {
              ...entity.componentConfig,
              [componentId]: {
                ...entity.componentConfig[componentId],
                values: {
                  ...entity.componentConfig[componentId].values,
                  [fieldId]: value,
                },
              },
            },
          };
        }),
      };
    }

    case ADD_COMPONENT_TO_ENTITY: {
      const { entityIndex, entityComponent } = action;
      return {
        ...state,
        entities: state.entities.map((entity, i) => {
          if (i !== entityIndex) {
            return entity;
          }
          return {
            ...entity,
            componentIds: [...entity.componentIds, entityComponent.id],
            componentConfig: {
              ...entity.componentConfig,
              [entityComponent.id]: entityComponent,
            },
          };
        }),
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
        activeSystemId: id,
        userDefinedSystems: {
          ...state.userDefinedSystems,
          [id]: {
            ...action.system,
            id,
          },
        },
      };
    }

    case ADD_USER_DEFINED_COMPONENT: {
      const { nextUserDefinedComponentId: id } = state;

      return {
        ...state,
        nextUserDefinedComponentId: 1 + id,
        activeComponentId: id,
        userDefinedComponents: {
          ...state.userDefinedComponents,
          [id]: {
            ...action.component,
            id,
          },
        },
      };
    }

    default: {
      return state;
    }
  }
};
