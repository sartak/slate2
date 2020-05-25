import { BaseSystem } from './base';

export const KeyboardInputSystemId = 'KeyboardInputSystem';

export class KeyboardInputSystem extends BaseSystem {
  id = KeyboardInputSystemId;
  label = 'KeyboardInput';
  requiredComponents = [];

  init(commandKeys, addEventListener) {
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

    addEventListener('keydown', (event) => {
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
    });

    addEventListener('keyup', (event) => {
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
    });

    return commandsDown;
  }

  input(commandsDown, frame) {
    for (let i = 0, len = commandsDown.length; i < len; ++i) {
      frame[commandsDown[i]] = true;
    }
  }
}
