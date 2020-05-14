import { TransformComponent } from '../../engine/components/Transform';
import { MotionComponent } from '../../engine/components/Motion';
import { JoystickComponent } from '../../engine/components/Joystick';
import { RenderRectangleComponent } from '../../engine/components/RenderRectangle';

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

const Components = [
  TransformComponent,
  MotionComponent,
  JoystickComponent,
  RenderRectangleComponent,
];

const ComponentByName = {};

Components.forEach((classInstance) => {
  ComponentByName[classInstance.name] = classInstance;
});

export { Components, ComponentByName };
