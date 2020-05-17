import { BaseComponent } from './base';

export const MotionComponentId = 'MotionComponent';

export class MotionComponent extends BaseComponent {
  static name = 'Motion';
  static id = MotionComponentId;
  id = MotionComponentId;
  static label = 'Motion';
  label = 'Motion';
  static fields = [
    { name: 'velocity_x', type: 'float', default: 0 },
    { name: 'velocity_y', type: 'float', default: 0 },
    { name: 'acceleration_x', type: 'float', default: 0 },
    { name: 'acceleration_y', type: 'float', default: 0 },
  ];

  fields = [
    { id: 'velocity_x', type: 'float', defaultValue: 0 },
    { id: 'velocity_y', type: 'float', defaultValue: 0 },
    { id: 'acceleration_x', type: 'float', defaultValue: 0 },
    { id: 'acceleration_y', type: 'float', defaultValue: 0 },
  ];
}
