export default class WebGPURenderer {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.width = null;
    this.height = null;
    this.clickHandler = null;
  }

  attach(container) {
    if (this.container) {
      this.detach();
    }

    this.container = container;

    const canvas = document.createElement('canvas');
    this.canvas = canvas;

    const { width, height } = container.getBoundingClientRect();
    this.width = canvas.width = Math.floor(width);
    this.height = canvas.height = Math.floor(height);

    // allow focus
    canvas.tabIndex = 1;

    const clickHandler = () => canvas.focus();
    this.addEventListener('click', clickHandler);
    this.clickHandler = clickHandler;

    container.appendChild(canvas);

    this.ctx = canvas.getContext('2d');
  }

  detach() {
    const { clickHandler, canvas, container } = this;

    if (clickHandler) {
      this.removeEventListener('click', clickHandler);
      this.clickHandler = null;
    }

    if (canvas) {
      this.canvas = null;
      this.ctx = null;
      canvas.parentNode?.removeChild(canvas);
    }

    this.container = null;
  }

  prepareRenderer() {
    const { ctx } = this;
    return [ctx];
  }

  beginRender() {
    const { canvas, ctx } = this;
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  }

  addEventListener(event, callback) {
    this.canvas?.addEventListener(event, callback);
  }

  removeEventListener(event, callback) {
    this.canvas?.removeEventListener(event, callback);
  }

  focus() {
    this.canvas?.focus();
  }
}
