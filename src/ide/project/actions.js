import * as t from './reducer';

export const createProjectAction = () => {
  return { type: t.CREATE_PROJECT };
};

export const loadProjectAction = (project) => {
  return { type: t.LOAD_PROJECT, project };
};

export const setRendererAction = (renderer) => {
  return { type: t.SET_RENDERER, renderer };
};

export const addEntityAction = (entity) => {
  return { type: t.ADD_ENTITY, entity };
};

export const setActiveEntityIndex = (index) => {
  return { type: t.SET_ACTIVE_ENTITY_INDEX, index };
};

export const commitSurfaceTransformAction = (surface) => {
  return { type: t.COMMIT_SURFACE_TRANSFORM, surface };
};

export const changeEntityComponentValueAction = (entityIndex, componentId, fieldId, value) => {
  return { type: t.CHANGE_ENTITY_COMPONENT_VALUE, entityIndex, componentId, fieldId, value };
};

export const addComponentToEntityAction = (entityIndex, entityComponent) => {
  return { type: t.ADD_COMPONENT_TO_ENTITY, entityIndex, entityComponent };
};

export const preflightRunningAction = (preflightRunning) => {
  return { type: t.PREFLIGHT_RUNNING, preflightRunning };
};

export const addUserDefinedSystem = (system) => {
  return { type: t.ADD_USER_DEFINED_SYSTEM, system };
};

export const addUserDefinedComponent = (component) => {
  return { type: t.ADD_USER_DEFINED_COMPONENT, component };
};
