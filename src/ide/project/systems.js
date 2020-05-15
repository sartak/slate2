import { MovementSystem } from '../../engine/systems/Movement';
import { RenderSystem } from '../../engine/systems/Render';

const Systems = [
  MovementSystem,
  RenderSystem,
];

const SystemByName = {};

Systems.forEach((classInstance) => {
  SystemByName[classInstance.name] = classInstance;
});

export { Systems, SystemByName };
