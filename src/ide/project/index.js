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
    default: {
      return state;
    }
  }
};
