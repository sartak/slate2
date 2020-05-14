import { TransformComponent } from '../../engine/components/Transform';
import { MotionComponent } from '../../engine/components/Motion';
import { JoystickComponent } from '../../engine/components/Joystick';
import { RenderRectangleComponent } from '../../engine/components/RenderRectangle';

export const newEntity = () => {
  return {
    components: [],
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
