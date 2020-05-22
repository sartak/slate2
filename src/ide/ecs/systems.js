import { MovementSystem } from '../systems/movement';
import { RenderSystem } from '../systems/render';
import { KeyboardInputSystem } from '../systems/keyboard-input';
import { UserDefinedSystem } from '../systems/user-defined';

import MovementSource from '!!raw-loader!../systems/movement';
import RenderSource from '!!raw-loader!../systems/render';
import KeyboardInputSource from '!!raw-loader!../systems/keyboard-input';

MovementSystem.sourceCode = MovementSource;
RenderSystem.sourceCode = RenderSource;
KeyboardInputSystem.sourceCode = KeyboardInputSource;

export const BuiltinSystems = [
  new MovementSystem,
  new RenderSystem,
  new KeyboardInputSystem,
];

export const newUserDefinedSystem = () => {
  return {
    id: null, // to be filled in by caller
    label: null, // to be filled in by caller
    requiredComponents: [],
  };
};

const selectSystemWithIdMemo = {};
BuiltinSystems.forEach((system) => {
  selectSystemWithIdMemo[system.id] = system;
});

export const lookupSystemWithId = (project, systemId) => {
  const builtin = selectSystemWithIdMemo[systemId];
  if (builtin) {
    return builtin;
  }

  // @Performance: memoize
  const config = project.userDefinedSystems[systemId];
  return new UserDefinedSystem(config);
};
