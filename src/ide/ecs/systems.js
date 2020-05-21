import { MovementSystem } from '../systems/movement';
import { RenderSystem } from '../systems/render';
import { KeyboardInputSystem } from '../systems/keyboard-input';

export const BuiltinSystems = [
  new MovementSystem,
  new RenderSystem,
  new KeyboardInputSystem,
];
