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

export const defaultsForComponent = (component) => {
  const defaults = {};

  component.fields.forEach(({ name, default: defaultValue }) => {
    defaults[name] = defaultValue;
  });

  return defaults;
};

export const newEntityComponent = (component, fields) => {
  return {
    name: component.name,
    fields: {
      ...defaultsForComponent(component),
      ...fields,
    },
  };
};

export const newEntity = (x, y) => {
  return {
    components: [
      newEntityComponent(TransformComponent, {x, y}),
      newEntityComponent(RenderRectangleComponent),
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

