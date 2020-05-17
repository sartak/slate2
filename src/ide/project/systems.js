import { MovementSystem } from '../systems/Movement';
import { RenderSystem } from '../systems/Render';

export const BuiltinSystems = [
  new MovementSystem,
  new RenderSystem,
];
