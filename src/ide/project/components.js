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

export const newEntity = (x, y) => {
  return {
    components: [
      {
        name: TransformComponent.name,
        fields: {
          ...defaultsForComponent(TransformComponent),
          x,
          y,
        },
      },
      {
        name: RenderRectangleComponent.name,
        fields: {
          ...defaultsForComponent(RenderRectangleComponent),
        },
      },
    ],
  };
};

const Components = [
  [TransformComponent, ''],
  [MotionComponent, ''],
  [JoystickComponent, ''],
  [RenderRectangleComponent, ''],
];

const ComponentByName = {};

Components.forEach((metadata) => {
  const [classInstance] = metadata;
  const name = classInstance.name;
  const label = name.slice(0, -9);
  metadata[1] = label;

  ComponentByName[name] = metadata;
});

export { Components, ComponentByName };
