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
    panX = 0;
    panY = 0;

    attach(...args) {
      const ret = super.attach(...args);
      const { canvas } = this;

      canvas.onmousedown = (e) => {
        const originX = e.pageX;
        const originY = e.pageY;
        const { panX, panY } = this;

        const mouseMove = (e) => {
          const dx = e.pageX - originX;
          const dy = e.pageY - originY;
          this.panX = Math.floor(panX + dx);
          this.panY = Math.floor(panY + dy);
          this.render();
        };

        document.addEventListener('mousemove', mouseMove);
        canvas.onmouseup = () => {
          document.removeEventListener('mousemove', mouseMove);
          canvas.onmouseup = null;
        };
      };

      return ret;
    }

    didResize() {
      const { container, canvas } = this;
      if (container && canvas) {
        const { width, height } = container.getBoundingClientRect();
        canvas.width = Math.floor(width);
        canvas.height = Math.floor(height);
        this.render();
      }
    }

    prepareRender() {
      super.prepareRender();
      const { ctx, panX, panY } = this;
      ctx.translate(panX, panY);
    }

    render() {
      super.render();
      this.drawGrid();
    }

    drawGrid() {
      const { canvas, ctx, panX, panY } = this;
      const { width, height } = canvas;

      const size = 32;

      ctx.strokeStyle = '#333';
      ctx.resetTransform();
      ctx.translate(0.5, 0.5); // crisper lines

      const x0 = panX % size - size;
      const x1 = x0 + width + 2 * size;
      const y0 = panY % size - size;
      const y1 = y0 + height + 2 * size;

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
