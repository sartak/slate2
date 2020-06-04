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

export const preflightRunningAction = (preflightRunning, preflightReplay = null) => {
  return { type: t.PREFLIGHT_RUNNING, preflightRunning, preflightReplay };
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

export const setCodeForUserDefinedSystemMethodAction = (id, method, code) => {
  return { type: t.SET_CODE_FOR_USER_DEFINED_SYSTEM_METHOD, id, method, code };
};

export const addRequiredComponentToUserDefinedSystemAction = (systemId, componentId) => {
  return { type: t.ADD_REQUIRED_COMPONENT_TO_USER_DEFINED_SYSTEM, systemId, componentId };
};

export const removeRequiredComponentFromUserDefinedSystemAction = (systemId, componentId) => {
  return { type: t.REMOVE_REQUIRED_COMPONENT_FROM_USER_DEFINED_SYSTEM, systemId, componentId };
};

export const setSelectedTabLabelAction = (id, label) => {
  return { type: t.SET_SELECTED_TAB_LABEL, id, label };
};

export const setBuildOptionAction = (key, value) => {
  return { type: t.SET_BUILD_OPTION, key, value };
};

export const addCommandAction = () => {
  return { type: t.ADD_COMMAND };
};

export const removeCommandAction = (id) => {
  return { type: t.REMOVE_COMMAND, id };
};

export const addKeyForCommandAction = (id, key) => {
  return { type: t.ADD_KEY_FOR_COMMAND, id, key };
};

export const removeKeyForCommandAction = (id, key) => {
  return { type: t.REMOVE_KEY_FOR_COMMAND, id, key };
};

export const setLabelForCommandAction = (id, label) => {
  return { type: t.SET_LABEL_FOR_COMMAND, id, label };
};

export const addRecordingAction = (recording) => {
  return { type: t.ADD_RECORDING, recording };
};
