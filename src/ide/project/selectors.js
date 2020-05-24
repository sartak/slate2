import { BuiltinComponents, lookupComponentWithId } from '../ecs/components';
import { BuiltinSystems, lookupSystemWithId } from '../ecs/systems';

export const selectProject = (state) => state;

export const makeSelectEntity = (id) => {
  return ({ entities }) => entities[id];
};

export const makeSelectComponent = (id) => {
  return (state) => lookupComponentWithId(state, id);
};

export const makeSelectSystem = (id) => {
  return (state) => lookupSystemWithId(state, id);
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

export const makeSelectComponentField = (componentId, fieldId) => {
  return (state) => {
    const component = lookupComponentWithId(state, componentId);
    return component.fieldWithId(fieldId);
  };
};

export const selectPreflightRunning = ({ preflightRunning }) => preflightRunning;

export const selectRenderer = ({ renderer }) => renderer;

export const selectSurface = ({ surface }) => surface;

export const selectEntities = ({ entities }) => entities;

export const selectEntityList = ({ entities }) => Object.values(entities);

export const selectAvailableComponentsList = (state) => {
  const { userDefinedComponents } = state;
  return [
    ...BuiltinComponents,
    ...Object.keys(userDefinedComponents).map((id) => lookupComponentWithId(state, id)),
  ];
};

export const selectAvailableSystemsList = (state) => {
  const { userDefinedSystems } = state;
  return [
    ...BuiltinSystems,
    ...Object.keys(userDefinedSystems).map((id) => lookupSystemWithId(state, id)),
  ];
};

export const selectEnabledComponents = selectAvailableComponentsList;

export const selectEnabledSystems = selectAvailableSystemsList;

export const selectActiveEntityId = ({ activeEntityId }) => activeEntityId;

export const selectActiveComponentId = ({ activeComponentId }) => activeComponentId;

export const selectActiveSystemId = ({ activeSystemId }) => activeSystemId;

export const selectActiveTypeId = ({ activeEntityId, activeComponentId, activeSystemId}) => {
  if (activeEntityId !== null) {
    return ['Entity', activeEntityId];
  } else if (activeComponentId !== null) {
    return ['Component', activeComponentId];
  } else if (activeSystemId !== null) {
    return ['System', activeSystemId];
  }

  return [null, null];
};

export const makeSelectTabLabel = (id) => {
  return ({ ide }) => ide.tabs[id];
};

export const makeSelectBuildOption = (key) => {
  return ({ build }) => build[key];
};
