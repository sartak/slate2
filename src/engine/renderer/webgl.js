export default class WebGLRenderer {
  container = null;
  canvas = null;
  ctx = null;
  width = null;
  height = null;

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
    container.appendChild(canvas);

    this.ctx = canvas.getContext('2d');
  }

  detach() {
    const { canvas, container } = this;
    if (canvas) {
      this.canvas = null;
      this.ctx = null;
      const parent = canvas.parentNode;
      if (parent) {
        parent.removeChild(canvas);
      }
    }

    if (container) {
      this.container = null;
    }
  }

  prepareRender() {
    const { canvas, ctx } = this;
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  }

  renderSceneGraph() {
  }

  render() {
    this.prepareRender();
    this.renderSceneGraph();
  }
}
