import { BaseSystem } from './base';

export const KeyboardInputSystemId = 'KeyboardInputSystem';

export class KeyboardInputSystem extends BaseSystem {
  id = KeyboardInputSystemId;
  label = 'KeyboardInput';
  requiredComponents = [];

  initSkipDesignMode = true;

  init(commandKeys) {
    const pressed = {};
    const keyToCommands = {};
    const commandsDown = new Array(Object.keys(commandKeys).length);
    commandsDown.length = 0;
    let commandsDownLength = 0;

    Object.entries(commandKeys).forEach(([command, keys]) => {
      keys.forEach((key) => {
        pressed[key] = false;
        if (!keyToCommands[key]) {
          keyToCommands[key] = [];
        }
        keyToCommands[key].push(command);
      });
    });

    const downListener = (event) => {
      const { key } = event;

      if (key in pressed) {
        event.preventDefault();
        pressed[key] = true;
        keyToCommands[key].forEach((command) => {
          if (commandsDown.indexOf(command) === -1) {
            commandsDown.push(command);
            commandsDownLength++;
          }
        });
      }
    };

    const upListener = (event) => {
      const { key } = event;

      if (key in pressed) {
        event.preventDefault();
        pressed[key] = false;
        keyToCommands[key].forEach((command) => {
          if (!commandKeys[command].find((k) => pressed[k])) {
            const index = commandsDown.indexOf(command);
            commandsDownLength--;
            commandsDown[index] = commandsDown[commandsDownLength];
            commandsDown.length = commandsDownLength;
          }
        });
      }
    };

    window.addEventListener('keydown', downListener);
    window.addEventListener('keyup', upListener);

    const detach = () => {
      window.removeEventListener('keydown', downListener);
      window.removeEventListener('keyup', upListener);
    };

    return [commandsDown, detach];
  }

  deinit([commandsDown, detach]) {
    detach();
  }

  input([commandsDown], frame) {
    for (let i = 0, len = commandsDown.length; i < len; ++i) {
      frame[commandsDown[i]] = true;
    }
  }
}
