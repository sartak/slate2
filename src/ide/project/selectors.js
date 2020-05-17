import { BuiltinComponents, BuiltinSystems } from './ecs';

export const selectEnabledComponents = (state) => {
  return [...BuiltinComponents];
};

export const selectEnabledSystems = (state) => {
  return [...BuiltinSystems];
};
