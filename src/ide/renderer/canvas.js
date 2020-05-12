import CanvasRenderer from '../../engine/renderer/canvas';

export default class CanvasRendererIDE extends CanvasRenderer {
  didResize() {
    const { container, canvas } = this;
    if (container && canvas) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      this.render();
    }
  }
}
