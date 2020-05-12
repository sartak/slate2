import Loop from './loop';

export default class Game {
  container = null;
  options = null;
  preloaded = false;
  activated = false;
  renderer = null;
  loop = null;

  constructor(options) {
    this.options = options;

    this.renderer = new this.options.renderer();
    this.loop = new Loop(options);

    this.loop.setRenderer(this.renderer);
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

    this.renderer.attach(container);

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
    if (!this.preloaded || !this.activated) {
      return;
    }

    this.loop.run();
  }
}