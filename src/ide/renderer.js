import BaseCanvasRenderer from '../engine/renderer/canvas';
import BaseWebGLRenderer from '../engine/renderer/webgl';
import BaseWebGPURenderer from '../engine/renderer/webgpu';
import { isElectron } from './App';

const classes = {};

[
  ['CanvasRenderer', BaseCanvasRenderer],
  ['WebGLRenderer', BaseWebGLRenderer],
  ['WebGPURenderer', BaseWebGPURenderer],
].forEach(([name, baseClass]) => {
  const dynamicClass = class extends baseClass {
    panX = 0;
    panY = 0;
    zoom = 1;
    prevZoom = 0.5;

    zoomAtScreenPoint(dz, x, y) {
      const newZoom = this.zoom * dz;

      if (newZoom > 10 || newZoom < 0.1) {
        return;
      }

      if (Math.abs(this.zoom - 1) >= 0.01) {
        this.prevZoom = this.zoom;
      }

      this.zoom = newZoom;
      this.panX = x - (x - this.panX) * dz;
      this.panY = y - (y - this.panY) * dz;
      this.render();
    }

    attach(...args) {
      const ret = super.attach(...args);
      const { canvas } = this;

      canvas.onmousedown = (e) => {
        e.preventDefault();

        const originX = e.pageX;
        const originY = e.pageY;
        const { panX, panY } = this;

        const finishMove = () => {
          document.removeEventListener('mousemove', mouseMove);
          canvas.onmouseup = null;
        };

        const mouseMove = (e) => {
          e.preventDefault();

          // this can occasionally happen
          if (e.buttons === 0) {
            finishMove();
            return;
          }

          const dx = e.pageX - originX;
          const dy = e.pageY - originY;
          this.panX = panX + dx;
          this.panY = panY + dy;
          this.render();
        };

        document.addEventListener('mousemove', mouseMove);
        canvas.onmouseup = (e) => {
          e.preventDefault();
          finishMove();
        };
      };

      // multitouch
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();

        // since we can't prevent user zoom in the web version, have
        // two-finger pan act as zoom, like in google maps
        if (e.ctrlKey || !isElectron) {
          const dz = Math.pow(2, -e.deltaY * 0.01);
          this.zoomAtScreenPoint(dz, e.offsetX, e.offsetY);
        } else {
          this.panX = this.panX - e.deltaX * 2;
          this.panY = this.panY - e.deltaY * 2;
          this.render();
        }
      });

      canvas.ondblclick = (e) => {
        e.preventDefault();

        let dz;
        if (Math.abs(this.zoom - 1) < 0.01) {
          dz = this.prevZoom / this.zoom;
        } else {
          dz = 1 / this.zoom;
        }

        this.zoomAtScreenPoint(dz, e.offsetX, e.offsetY);
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
      const { ctx, panX, panY, zoom } = this;
      ctx.setTransform(zoom, 0, 0, zoom, panX, panY);
    }

    render() {
      super.render();
      this.drawGrid();
    }

    drawGrid() {
      const { canvas, ctx, panX, panY, zoom } = this;
      const { width, height } = canvas;

      const size = 32 * zoom;
      if (size < 8) {
        return;
      }

      ctx.strokeStyle = '#333';
      ctx.resetTransform();
      ctx.translate(0.5, 0.5); // crisper lines

      const x0 = Math.floor(panX % size - size);
      const x1 = Math.floor(x0 + width + 2 * size);
      const y0 = Math.floor(panY % size - size);
      const y1 = Math.floor(y0 + height + 2 * size);

      for (let x = x0; x < x1; x += size) {
        ctx.moveTo(Math.floor(x), y0);
        ctx.lineTo(Math.floor(x), y1);
        ctx.stroke();
      }

      for (let y = y0; y < y1; y += size) {
        ctx.moveTo(x0, Math.floor(y));
        ctx.lineTo(x1, Math.floor(y));
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
