import { BaseComponent } from './base';

export const MotionComponentId = 'MotionComponent';

export class MotionComponent extends BaseComponent {
  static name = 'Motion';
  static id = MotionComponentId;
  static label = 'Motion';
  static fields = [
    { name: 'velocity_x', type: 'float', default: 0 },
    { name: 'velocity_y', type: 'float', default: 0 },
    { name: 'acceleration_x', type: 'float', default: 0 },
    { name: 'acceleration_y', type: 'float', default: 0 },
  ];
}
