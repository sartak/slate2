import { BaseComponent } from './base';

export const TransformComponentId = 'TransformComponent';

export class TransformComponent extends BaseComponent {
  id = TransformComponentId;
  label = 'Transform';
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
