export class MotionComponent {
  static name = 'Motion';
  static fields = [
    { name: 'velocity_x', type: 'float', default: 0 },
    { name: 'velocity_y', type: 'float', default: 0 },
    { name: 'acceleration_x', type: 'float', default: 0 },
    { name: 'acceleration_y', type: 'float', default: 0 },
  ];

  velocity_x = null;
  velocity_y = null;
  acceleration_x = null;
  acceleration_y = null;
}
