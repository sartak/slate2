import { MovementSystem } from '../systems/movement';
import { RenderSystem } from '../systems/render';

export const BuiltinSystems = [
  new MovementSystem,
  new RenderSystem,
];
