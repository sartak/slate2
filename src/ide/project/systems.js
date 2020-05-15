import { MovementSystem } from '../../engine/systems/Movement';

const Systems = [
  MovementSystem,
];

const SystemByName = {};

Systems.forEach((classInstance) => {
  SystemByName[classInstance.name] = classInstance;
});

export { Systems, SystemByName };
