import { TransformComponent } from '../components/transform';
import { MotionComponent } from '../components/motion';
import { JoystickComponent } from '../components/joystick';
import { RenderRectangleComponent } from '../components/render-rectangle';

export const BuiltinComponents = [
  new TransformComponent,
  new MotionComponent,
  new JoystickComponent,
  new RenderRectangleComponent,
];
