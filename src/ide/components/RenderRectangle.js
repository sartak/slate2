import { BaseComponent } from './base';

export const RenderRectangleComponentId = 'RenderRectangleComponent';

export class RenderRectangleComponent extends BaseComponent {
  static name = 'RenderRectangle';
  static id = RenderRectangleComponentId;
  static label = 'RenderRectangle';
  static fields = [
    { name: 'w', type: 'float', default: 100 },
    { name: 'h', type: 'float', default: 100 },
    { name: 'color', type: 'color', default: '#FFFFFF' },
  ];
}
