import BaseCanvasRenderer from '../engine/renderer/canvas';
import BaseWebGLRenderer from '../engine/renderer/webgl';
import BaseWebGPURenderer from '../engine/renderer/webgpu';

const classes = {};

const MaxZoom = 10;
const MinZoom = 0.1;
const PrevZoomThreshold = 0.05;

[
  ['CanvasRenderer', BaseCanvasRenderer],
  ['WebGLRenderer', BaseWebGLRenderer],
  ['WebGPURenderer', BaseWebGPURenderer],
].forEach(([name, baseClass]) => {
  const dynamicRendererSubclass = class extends baseClass {
    panX = 0;
    panY = 0;
    zoom = 1;
    prevZoom = 0.5;
    onCommitTransform = null;
    wheelTimeout = null;
    isTransforming = false;
    preflight = null;

    constructor(preflight, opts, onCommitTransform) {
      super();

      this.preflight = preflight;
      this.preflight.setRenderer(this);

      this.panX = Number(opts.panX) || 0;
      this.panY = Number(opts.panY) || 0;
      this.zoom = Number(opts.zoom) || 1;
      this.prevZoom = Number(opts.prevZoom) || 0.5;
      this.onCommitTransform = onCommitTransform;
    }

    isTransform({ panX, panY, zoom }) {
      return this.panX === Number(panX) && this.panY === Number(panY) && this.zoom === Number(zoom);
    }

    changeTransform(opts) {
      // If we receive an event from redux, but the user already started
      // enacting a new transform, then the user wins
      if (this.isTransforming) {
        return;
      }

      const panX = Number(opts.panX);
      const panY = Number(opts.panY);
      const zoom = Number(opts.zoom);

      if (this.panX === panX && this.panY === panY && this.zoom === zoom) {
        return;
      }

      this.panX = panX;
      this.panY = panY;
      this.zoom = zoom;
      this.prevZoom = Number(opts.prevZoom);

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

      if (newZoom > MaxZoom || newZoom < MinZoom) {
        return;
      }

      if (Math.abs(this.zoom - 1) >= PrevZoomThreshold) {
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

      // multitouch with trackpad
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

        if (e.ctrlKey) {
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
        if (Math.abs(this.zoom - 1) < PrevZoomThreshold) {
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

    beginRender() {
      super.beginRender();
      const { ctx, panX, panY, zoom } = this;
      ctx.setTransform(zoom, 0, 0, zoom, panX, panY);
    }

    render() {
      if (this.preflight.isRunning) {
        return;
      }

      this.preflight.runRenderSystems();
    }

    finishRender() {
      // @Feature: make this an option
      if (!this.preflight.isRunning) {
        this.drawGrid();
      }
    }

    drawGrid() {
      const { canvas, ctx, panX, panY, zoom, width, height } = this;

      const size = 32 * zoom;
      if (size < 16) {
        return;
      }

      ctx.strokeStyle = '#333';
      ctx.resetTransform();

      // Using the half-pixel grid tells the canvas engine to use crisper
      // lines (1 pixel rather than 1 point)
      ctx.translate(0.5, 0.5);

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

  classes[name] = dynamicRendererSubclass;
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
