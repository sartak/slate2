import { newProject } from './upgrade';
import { newEntity } from './ecs';

export { newEntity };

const CREATE_PROJECT = 'create-project';

export const createProjectActionStatic = {
  'type': CREATE_PROJECT,
};

export const createProjectAction = () => {
  return createProjectActionStatic;
};

const LOAD_PROJECT = 'load-project';
export const loadProjectAction = (project) => {
  return { 'type': LOAD_PROJECT, project };
};

const SET_RENDERER = 'set-renderer';
export const setRendererAction = (renderer) => {
  return { 'type': SET_RENDERER, renderer };
};

const ADD_ENTITY = 'add-entity';
export const addEntityAction = (entity) => {
  return { 'type': ADD_ENTITY, entity };
};

const SELECT_ENTITY_INDEX = 'select-entity-index';
export const selectEntityIndexAction = (index) => {
  return { 'type': SELECT_ENTITY_INDEX, index };
};

const COMMIT_SURFACE_TRANSFORM = 'commit-surface-transform';
export const commitSurfaceTransformAction = (surface) => {
  return { 'type': COMMIT_SURFACE_TRANSFORM, surface };
};

const CHANGE_ENTITY_COMPONENT_VALUE = 'change-entity-component-value';
export const changeEntityComponentValueAction = (entityIndex, componentName, fieldName, value) => {
  return { 'type': CHANGE_ENTITY_COMPONENT_VALUE, entityIndex, componentName, fieldName, value };
};

const ADD_COMPONENT_TO_ENTITY = 'add-component-to-entity';
export const addComponentToEntityAction = (entityIndex, entityComponent) => {
  return { 'type': ADD_COMPONENT_TO_ENTITY, entityIndex, entityComponent };
};

const START_PREFLIGHT = 'start-preflight';

export const startPreflightActionStatic = {
  'type': START_PREFLIGHT,
};

export const startPreflightAction = () => {
  return startPreflightActionStatic;
};

const STOP_PREFLIGHT = 'stop-preflight';

export const stopPreflightActionStatic = {
  'type': STOP_PREFLIGHT,
};

export const stopPreflightAction = () => {
  return stopPreflightActionStatic;
};

export const projectReducer = (state = null, action) => {
  switch (action.type) {
    case CREATE_PROJECT: {
      return newProject();
    }
    case LOAD_PROJECT: {
      return action.project;
    }
    case SET_RENDERER: {
      return {...state, renderer: action.renderer};
    }
    case ADD_ENTITY: {
      return {
        ...state,
        nextEntityId: 1 + state.nextEntityId,
        selectedEntityIndex: state.entities.length,
        entities: [
          ...state.entities,
          { ...action.entity, __id: state.nextEntityId },
        ],
      };
    }
    case SELECT_ENTITY_INDEX: {
      return {...state, selectedEntityIndex: action.index};
    }
    case COMMIT_SURFACE_TRANSFORM: {
      return {...state, surface: action.surface};
    }
    case CHANGE_ENTITY_COMPONENT_VALUE: {
      const {entityIndex, componentName, fieldName, value} = action;
      return {
        ...state,
        entities: state.entities.map((entity, i) => {
          if (i !== entityIndex) {
            return entity;
          }
          return {
            ...entity,
            components: entity.components.map((component) => {
              if (component.name !== componentName) {
                return component;
              }

              return {
                ...component,
                fields: {
                  ...component.fields,
                  [fieldName]: value,
                },
              };
            }),
          };
        }),
      };
    }
    case ADD_COMPONENT_TO_ENTITY: {
      const {entityIndex, entityComponent} = action;
      return {
        ...state,
        entities: state.entities.map((entity, i) => {
          if (i !== entityIndex) {
            return entity;
          }
          return {
            ...entity,
            components: [...entity.components, entityComponent],
          };
        }),
      };
    }
    case START_PREFLIGHT: {
      return {...state, preflightRunning: true};
    }
    case STOP_PREFLIGHT: {
      return {...state, preflightRunning: false};
    }
    default: {
      return state;
    }
  }
};
