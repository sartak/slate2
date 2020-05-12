import BaseCanvasRenderer from '../engine/renderer/canvas';
import BaseWebGLRenderer from '../engine/renderer/webgl';
import BaseWebGPURenderer from '../engine/renderer/webgpu';

const classes = {};

[
  ['CanvasRenderer', BaseCanvasRenderer],
  ['WebGLRenderer', BaseWebGLRenderer],
  ['WebGPURenderer', BaseWebGPURenderer],
].forEach(([name, baseClass]) => {
  const dynamicClass = class extends baseClass {
    didResize() {
      const { container, canvas } = this;
      if (container && canvas) {
        const { width, height } = container.getBoundingClientRect();
        canvas.width = Math.floor(width);
        canvas.height = Math.floor(height);
        this.render();
      }
    }

    render() {
      super.render();
      this.drawGrid();
    }

    drawGrid() {
      const { canvas, ctx } = this;
      const { width, height } = canvas;

      const size = 32;

      ctx.strokeStyle = '#333';
      ctx.resetTransform();
      ctx.translate(0.5, 0.5); // crisper lines

      const x0 = 0;
      const x1 = width;
      const y0 = 0;
      const y1 = height;

      for (let x = x0; x < x1; x += size) {
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
      }

      for (let y = y0; y < y1; y += size) {
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
      }
    }
  };

  classes[name] = dynamicClass;
});

export let
  CanvasRenderer = classes.CanvasRenderer,
  WebGLRenderer = classes.WebGLRenderer,
  WebGPURenderer = classes.WebGPURenderer;

export const rendererForType = (type) => {
  switch (type) {
    case 'canvas': return CanvasRenderer;
    case 'webgl': return WebGLRenderer;
    case 'webgpu': return WebGPURenderer;
    default: throw new Error(`Unknown renderer type '${type}'`);
  }
};
