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

export const setActiveEntityAction = (id) => {
  return { type: t.SET_ACTIVE_ENTITY, id };
};

export const commitSurfaceTransformAction = (surface) => {
  return { type: t.COMMIT_SURFACE_TRANSFORM, surface };
};

export const changeEntityComponentValueAction = (entityId, componentId, fieldId, value) => {
  return { type: t.CHANGE_ENTITY_COMPONENT_VALUE, entityId, componentId, fieldId, value };
};

export const addComponentToEntityAction = (id, entityComponent) => {
  return { type: t.ADD_COMPONENT_TO_ENTITY, id, entityComponent };
};

export const preflightRunningAction = (preflightRunning) => {
  return { type: t.PREFLIGHT_RUNNING, preflightRunning };
};

export const addUserDefinedSystemAction = (system) => {
  return { type: t.ADD_USER_DEFINED_SYSTEM, system };
};

export const setActiveSystemAction = (id) => {
  return { type: t.SET_ACTIVE_SYSTEM, id };
};

export const addUserDefinedComponentAction = (component) => {
  return { type: t.ADD_USER_DEFINED_COMPONENT, component };
};

export const setActiveComponentAction = (id) => {
  return { type: t.SET_ACTIVE_COMPONENT, id };
};

export const setEntityLabelAction = (id, label) => {
  return { type: t.SET_ENTITY_LABEL, id, label };
};

export const setUserDefinedComponentLabelAction = (id, label) => {
  return { type: t.SET_USER_DEFINED_COMPONENT_LABEL, id, label };
};

export const addFieldToUserDefinedComponentAction = (id, field) => {
  return { type: t.ADD_FIELD_TO_USER_DEFINED_COMPONENT, id, field };
};

export const setUserDefinedComponentFieldMetadataAction = (componentId, fieldId, key, value) => {
  return { type: t.SET_USER_DEFINED_COMPONENT_FIELD_METADATA, componentId, fieldId, key, value };
};

export const setUserDefinedSystemLabelAction = (id, label) => {
  return { type: t.SET_USER_DEFINED_SYSTEM_LABEL, id, label };
};

export const setCodeForUserDefinedSystemMethod = (id, method, code) => {
  return { type: t.SET_CODE_FOR_USER_DEFINED_SYSTEM_METHOD, id, method, code };
};
