import { BaseSystem } from './base';

export const KeyboardInputSystemId = 'KeyboardInputSystem';

export class KeyboardInputSystem extends BaseSystem {
  id = KeyboardInputSystemId;
  label = 'KeyboardInput';
  requiredComponents = [];

  initSkipDesignMode = true;

  init() {
    const capture = {
      // todo
    };

    const pressed = {};
    Object.keys(capture).forEach((key) => {
      pressed[key] = false;
    });

    const downListener = (event) => {
      const { key } = event;

      if (capture[key]) {
        event.preventDefault();
        pressed[key] = true;
      }
    };

    const upListener = (event) => {
      const { key } = event;

      if (capture[key]) {
        event.preventDefault();
        pressed[key] = false;
      }
    };

    window.addEventListener('keydown', downListener);
    window.addEventListener('keyup', upListener);

    return [pressed, downListener, upListener];
  }

  deinit([pressed, downListener, upListener]) {
    window.removeEventListener('keydown', downListener);
    window.removeEventListener('keyup', upListener);
  }

  input([pressed]) {
    // todo
  }
}