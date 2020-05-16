import { TransformComponent } from '../../engine/components/Transform';
import { MotionComponent } from '../../engine/components/Motion';
import { JoystickComponent } from '../../engine/components/Joystick';
import { RenderRectangleComponent } from '../../engine/components/RenderRectangle';

import { MovementSystem } from '../../engine/systems/Movement';
import { RenderSystem } from '../../engine/systems/Render';

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

Components.forEach((classInstance) => {
  ComponentByName[classInstance.name] = classInstance;
});

export { Components, ComponentByName };

const SystemByName = {};

Systems.forEach((classInstance) => {
  SystemByName[classInstance.name] = classInstance;
});

export { Systems, SystemByName };

