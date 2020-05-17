import { BuiltinComponents } from './components';
import { BuiltinSystems } from './systems';

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

export const makeSelectEntityComponent = (entityIndex, componentId) => {
  return ({ entities }) => entities[entityIndex].componentConfig[componentId];
};

export const selectPreflightRunning = ({ preflightRunning }) => preflightRunning;
