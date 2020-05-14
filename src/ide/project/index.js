import { newProject } from './upgrade';

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
        entities: [
          ...state.entities,
          { __id: state.nextEntityId, ...action.entity },
        ],
      };
    }
    case SELECT_ENTITY_INDEX: {
      return {...state, selectedEntityIndex: action.index};
    }
    case COMMIT_SURFACE_TRANSFORM: {
      return {...state, surface: action.surface};
    }
    default: {
      return state;
    }
  }
};
