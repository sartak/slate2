export class RenderRectangleComponent {
  static name = 'RenderRectangle';
  static fields = [
    { name: 'w', type: 'float', default: 100 },
    { name: 'h', type: 'float', default: 100 },
    { name: 'color', type: 'color', default: '#FFFFFF' },
  ];

  w = null;
  h = null;
  color = null;
}
