export default class Loop {
  options = null;
  raf = null;

  constructor(options) {
    this.options = options;
  }

  run() {
    let {init, update, render, renderer} = this.options;

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
      renderer.beginRender();
      render(dt, time);

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
