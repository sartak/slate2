import { TransformComponent } from '../components/Transform';
import { MotionComponent } from '../components/Motion';
import { JoystickComponent } from '../components/Joystick';
import { RenderRectangleComponent } from '../components/RenderRectangle';

import { MovementSystem } from '../systems/Movement';
import { RenderSystem } from '../systems/Render';

const Components = [
  TransformComponent,
  MotionComponent,
  JoystickComponent,
  RenderRectangleComponent,
];

const Systems = [
  MovementSystem,
  RenderSystem,
];

export const newEntity = (x, y) => {
  return {
    __id: null, // to be filled in by caller

    components: [
      TransformComponent.makeEntityComponent({x, y}),
      RenderRectangleComponent.makeEntityComponent(),
    ],

    componentIds: [TransformComponent.id, RenderRectangleComponent.id],
    componentConfig: {
      [TransformComponent.id]: TransformComponent.makeEntityComponent({x, y}),
      [RenderRectangleComponent.id]: RenderRectangleComponent.makeEntityComponent(),
    },
  };
};

const ComponentByName = {};
const ComponentByClassName = {};
const ComponentIdToName = {};

Components.forEach((classInstance) => {
  ComponentByName[classInstance.name] = classInstance;
  ComponentIdToName[classInstance.id] = classInstance.name;
  ComponentByClassName[`${classInstance.name}Component`] = classInstance;
});

export { Components, ComponentByName, ComponentByClassName };

export { ComponentIdToName };

const SystemByName = {};
const SystemByClassName = {};

Systems.forEach((classInstance) => {
  SystemByName[classInstance.name] = classInstance;
  SystemByClassName[`${classInstance.name}System`] = classInstance;
});

export { Systems, SystemByName, SystemByClassName };

const BuiltinComponents = [
  new TransformComponent,
  new MotionComponent,
  new JoystickComponent,
  new RenderRectangleComponent,
];

export { BuiltinComponents };

const BuiltinSystems = [
  new MovementSystem,
  new RenderSystem,
];

export { BuiltinSystems };

