export default class Game {
  constructor(options) {
    this.options = options;
    this.container = null;
    this.preloaded = false;
    this.activated = false;
  }

  attach(container) {
    this.container = container;
    container.style.width = "800px";
    container.style.height = "600px";
    container.classList.add('awaiting-activation');

    const clickHandler = (e) => {
      e.preventDefault();
      container.classList.remove('awaiting-activation');
      container.removeEventListener('click', clickHandler);
      this.activated = true;
      this.run();
    };

    container.addEventListener('click', clickHandler);

    this.options.renderer?.attach(container);

    return this;
  }

  preload() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.preloaded = true;
        resolve();
        this.run();
      });
    });
  }

  run() {
    const { init, loop } = this.options;
    if (!this.preloaded || !this.activated) {
      return;
    }

    if (init) {
      init();
    }

    if (loop) {
      loop.run();
    }
  }
}
