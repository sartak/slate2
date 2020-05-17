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
  };
};

const ComponentByName = {};
const ComponentByClassName = {};

Components.forEach((classInstance) => {
  ComponentByName[classInstance.name] = classInstance;
  ComponentByClassName[`${classInstance.name}Component`] = classInstance;
});

export { Components, ComponentByName, ComponentByClassName };

const SystemByName = {};
const SystemByClassName = {};

Systems.forEach((classInstance) => {
  SystemByName[classInstance.name] = classInstance;
  SystemByClassName[`${classInstance.name}System`] = classInstance;
});

export { Systems, SystemByName, SystemByClassName };

