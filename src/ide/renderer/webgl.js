import WebGLRenderer from '../../engine/renderer/webgl';

export default class WebGLRendererIDE extends WebGLRenderer{
  didResize() {
    const { container, canvas } = this;
    if (container && canvas) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      this.render();
    }
  }
}
