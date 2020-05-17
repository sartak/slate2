export class BaseComponent {
  static name = null;
  static id = null;
  id = null;
  static label = null;
  label = null;
  static fields = [];
  fields = [];

  static makeEntityComponent(overrides) {
    const defaults = {};

    this.fields.forEach(({ name, default: defaultValue }) => {
      defaults[name] = defaultValue;
    });

    return {
      name: this.name,
      id: this.id,
      values: {
        ...defaults,
        ...overrides,
      },
    };
  }

  makeEntityComponent(...args) {
    const defaults = {};

    this.fields.forEach(({ id, defaultValue }) => {
      defaults[id] = defaultValue;
    });

    return {
      name: this.name,
      id: this.id,
      values: {
        ...defaults,
        ...overrides,
      },
    };
  }
}
