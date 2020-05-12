export default class Loop {
  options = null;
  renderer = null;
  raf = null;

  constructor(options) {
    this.options = options;
  }

  setRenderer(renderer) {
    this.renderer = renderer;
  }

  run() {
    let {init, update} = this.options;

    init();
    let prev = 0;
    let time = 0;

    const step = () => {
      const now = window.performance.now();

      let dt;
      if (!prev) {
        dt = 0;
      }
      else {
        dt = now - prev;
      }
      time += dt;

      update(dt, time);

      const {renderer} = this;
      if (renderer) {
        renderer.render();
      }

      prev = now;

      this.raf = window.requestAnimationFrame(step);
    };

    this.raf = window.requestAnimationFrame(step);
  }

  pause() {
    if (this.raf) {
      window.cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }
}
