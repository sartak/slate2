import { TransformComponent } from '../components/Transform';
import { MotionComponent } from '../components/Motion';
import { JoystickComponent } from '../components/Joystick';
import { RenderRectangleComponent } from '../components/RenderRectangle';

import { MovementSystem } from '../systems/Movement';
import { RenderSystem } from '../systems/Render';

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

