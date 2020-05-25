export default class Game {
  constructor(options) {
    this.options = options;
    this.container = null;
    this.preloaded = false;
    this.activated = false;
  }

  attach(container) {
    const { width, height, renderer } = this.options;

    this.container = container;
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.classList.add('awaiting-activation');

    const clickHandler = (e) => {
      e.preventDefault();
      container.classList.remove('awaiting-activation');
      container.removeEventListener('click', clickHandler);
      this.activated = true;
      this.run();
    };

    container.addEventListener('click', clickHandler);

    renderer?.attach(container);

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
    const { init, loop, renderer } = this.options;
    if (!this.preloaded || !this.activated) {
      return;
    }

    init?.();
    renderer?.focus();
    loop?.run();
  }
}
