import { BaseComponent } from './base';

export const MotionComponentId = 'MotionComponent';

export class MotionComponent extends BaseComponent {
  id = MotionComponentId;
  label = 'Motion';
  fields = [
    { id: 'velocity_x', type: 'float', defaultValue: 0 },
    { id: 'velocity_y', type: 'float', defaultValue: 0 },
    { id: 'acceleration_x', type: 'float', defaultValue: 0 },
    { id: 'acceleration_y', type: 'float', defaultValue: 0 },
  ];
}
