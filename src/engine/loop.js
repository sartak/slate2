export default class Loop {
  step = null;
  raf = null;

  constructor(step) {
    this.step = step;
  }

  run() {
    const {step} = this;

    let prev = window.performance.now();
    let time = 0;

    const frame = () => {
      const now = window.performance.now();
      const dt = now - prev;
      time += dt;

      step(dt, time);

      prev = now;

      this.raf = window.requestAnimationFrame(frame);
    };

    this.raf = window.requestAnimationFrame(frame);
  }

  pause() {
    if (this.raf) {
      window.cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }
}
