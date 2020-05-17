import { BaseComponent } from './base';

export const TransformComponentId = 'TransformComponent';

export class TransformComponent extends BaseComponent {
  static name = 'Transform';
  static id = TransformComponentId;
  id = TransformComponentId;
  static label = 'Transform';
  label = 'Transform';
  static fields = [
    { name: 'parent', type: 'entity', default: null },
    { name: 'x', type: 'float', default: 0 },
    { name: 'y', type: 'float', default: 0 },
    { name: 'z', type: 'float', default: 0 },
    { name: 'rotation', type: 'float', default: 0 },
    { name: 'scale_x', type: 'float', default: 1 },
    { name: 'scale_y', type: 'float', default: 1 },
  ];

  fields = [
    { id: 'parent', type: 'entity', defaultValue: null },
    { id: 'x', type: 'float', defaultValue: 0 },
    { id: 'y', type: 'float', defaultValue: 0 },
    { id: 'z', type: 'float', defaultValue: 0 },
    { id: 'rotation', type: 'float', defaultValue: 0 },
    { id: 'scale_x', type: 'float', defaultValue: 1 },
    { id: 'scale_y', type: 'float', defaultValue: 1 },
  ];
}
