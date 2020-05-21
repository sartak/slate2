import { MovementSystem } from '../systems/movement';
import { RenderSystem } from '../systems/render';
import { KeyboardInputSystem } from '../systems/keyboard-input';

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
