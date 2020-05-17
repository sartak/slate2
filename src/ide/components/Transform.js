import { BaseComponent } from './base';

export class TransformComponent extends BaseComponent {
  static name = 'Transform';
  static fields = [
    { name: 'parent', type: 'entity', default: null },
    { name: 'x', type: 'float', default: 0 },
    { name: 'y', type: 'float', default: 0 },
    { name: 'z', type: 'float', default: 0 },
    { name: 'rotation', type: 'float', default: 0 },
    { name: 'scale_x', type: 'float', default: 1 },
    { name: 'scale_y', type: 'float', default: 1 },
  ];
}
