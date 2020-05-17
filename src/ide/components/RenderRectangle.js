import { BaseComponent } from './base';

export const RenderRectangleComponentId = 'RenderRectangleComponent';

export class RenderRectangleComponent extends BaseComponent {
  id = RenderRectangleComponentId;
  label = 'RenderRectangle';
  fields = [
    { id: 'w', type: 'float', defaultValue: 100 },
    { id: 'h', type: 'float', defaultValue: 100 },
    { id: 'color', type: 'color', defaultValue: '#FFFFFF' },
  ];
}
