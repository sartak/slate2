import WebGPURenderer from '../../engine/renderer/webgpu';

export default class WebGPURendererIDE extends WebGPURenderer {
  didResize() {
    const { container, canvas } = this;
    if (container && canvas) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      this.render();
    }
  }
}
