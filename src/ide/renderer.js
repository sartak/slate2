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
