import { BuiltinComponents, BuiltinSystems } from './ecs';

export const selectEnabledComponents = (state) => {
  return BuiltinComponents;
};

export const selectEnabledSystems = (state) => {
  return BuiltinSystems;
};

const _selectComponentWithIdMemo = {};
export const makeSelectComponentWithId = (componentId) => {
  return (state) => {
    if (!_selectComponentWithIdMemo[componentId]) {
      const builtinComponent = BuiltinComponents.find((component) => component.id === componentId);
      if (builtinComponent) {
        _selectComponentWithIdMemo[componentId] = builtinComponent;
      } else {
        // construct UserDefinedComponent from state
      }
    }
    return _selectComponentWithIdMemo[componentId];
  };
};

const _selectSystemWithIdMemo = {};
export const makeSelectSystemWithId = (systemId) => {
  return (state) => {
    if (!_selectSystemWithIdMemo[systemId]) {
      const builtinSystem = BuiltinSystems.find((system) => system.id === systemId);
      if (builtinSystem) {
        _selectSystemWithIdMemo[systemId] = builtinSystem;
      } else {
        // construct UserDefinedSystem from state
      }
    }
    return _selectSystemWithIdMemo[systemId];
  };
};

export const makeSelectEntityComponent = (entityIndex, componentId) => {
  return ({ entities }) => entities[entityIndex].componentConfig[componentId];
};

export const selectPreflightRunning = ({ preflightRunning }) => preflightRunning;
