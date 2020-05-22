import { BuiltinComponents } from '../ecs/components';
import { BuiltinSystems } from '../ecs/systems';

export const selectProject = (state) => state;

export const makeSelectEntity = (id) => {
  return ({ entities }) => entities[id];
};

export const selectEnabledComponents = (state) => {
  return BuiltinComponents;
};

export const selectEnabledSystems = (state) => {
  return BuiltinSystems;
};

const _selectComponentWithIdMemo = {};
BuiltinComponents.forEach((component) => {
  _selectComponentWithIdMemo[component.id] = component;
});

export const lookupComponentWithId = (project, componentId) => {
  if (!_selectComponentWithIdMemo[componentId]) {
    // construct UserDefinedComponent from project
  }
  return _selectComponentWithIdMemo[componentId];
};

export const makeSelectComponentWithId = (componentId) => {
  return (state) => lookupComponentWithId(state, componentId);
};

const _selectSystemWithIdMemo = {};
BuiltinSystems.forEach((system) => {
  _selectSystemWithIdMemo[system.id] = system;
});

export const lookupSystemWithId = (project, systemId) => {
  if (!_selectSystemWithIdMemo[systemId]) {
    // construct UserDefinedSystem from project
  }
  return _selectSystemWithIdMemo[systemId];
};

export const makeSelectSystemWithId = (systemId) => {
  return (state) => lookupSystemWithId(state, systemId);
};

export const makeSelectEntityComponentValue = (entityId, componentId, fieldId) => {
  return ({ entities }) => entities[entityId].componentConfig[componentId].values[fieldId];
};

export const makeSelectEntityComponent = (entityId, componentId) => {
  return ({ entities }) => entities[entityId].componentConfig[componentId];
};

export const makeSelectEntityComponents = (entityId, componentIds) => {
  return ({ entities }) => {
    if (entityId === null) {
      return null;
    }

    const { componentConfig } = entities[entityId];
    return componentIds.map((componentId) => componentConfig[componentId]);
  };
};

export const selectPreflightRunning = ({ preflightRunning }) => preflightRunning;

export const selectRenderer = ({ renderer }) => renderer;

export const selectSurface = ({ surface }) => surface;

export const selectEntities = ({ entities }) => entities;

export const selectEntityList = ({ entities }) => Object.values(entities);

export const selectActiveEntityId = ({ activeEntityId }) => activeEntityId;
