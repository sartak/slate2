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
    onCommitTransform = null;
    wheelTimeout = null;
    isTransforming = false;

    constructor(opts, onCommitTransform) {
      super();

      this.panX = opts.panX || 0;
      this.panY = opts.panY || 0;
      this.zoom = opts.zoom || 1;
      this.prevZoom = opts.prevZoom || 0.5;
      this.onCommitTransform = onCommitTransform;
    }

    changeTransform(opts) {
      // If we receive an event from redux, but the user already started
      // enacting a new transform, then the user wins
      if (this.isTransforming) {
        return;
      }

      if (this.panX === opts.panX && this.panY === opts.panY && this.zoom === opts.zoom) {
        return;
      }

      this.panX = opts.panX;
      this.panY = opts.panY;
      this.zoom = opts.zoom;
      this.prevZoom = opts.prevZoom;

      this.render();
    }

    beginTransform() {
      if (this.isTransforming) {
        return;
      }

      this.isTransforming = true;
    }

    commitTransform() {
      this.isTransforming = false;

      if (!this.onCommitTransform) {
        return;
      }

      this.onCommitTransform({
        panX: this.panX,
        panY: this.panY,
        zoom: this.zoom,
        prevZoom: this.prevZoom,
      });
    }

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

        this.beginTransform();

        const originX = e.pageX;
        const originY = e.pageY;
        const { panX, panY } = this;
        let sawMove = false;

        const finishMove = () => {
          document.removeEventListener('mousemove', mouseMove);
          canvas.onmouseup = null;

          if (sawMove) {
            this.commitTransform();
          }
        };

        const mouseMove = (e) => {
          e.preventDefault();

          // this can occasionally happen
          if (e.buttons === 0) {
            finishMove();
            return;
          }

          sawMove = true;
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

        this.beginTransform();

        // we don't get an end notification
        if (this.wheelTimeout) {
          clearTimeout(this.wheelTimeout);
        }

        this.wheelTimeout = setTimeout(() => {
          this.commitTransform();
        }, 100);

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

        this.beginTransform();
        this.zoomAtScreenPoint(dz, e.offsetX, e.offsetY);
        this.commitTransform();
      };

      return ret;
    }

    didResize() {
      const { container, canvas } = this;
      if (container && canvas) {
        const { width, height } = container.getBoundingClientRect();
        this.width = canvas.width = Math.floor(width);
        this.height = canvas.height = Math.floor(height);
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
      const { canvas, ctx, panX, panY, zoom, width, height } = this;

      const size = 32 * zoom;
      if (size < 16) {
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
