export class BaseComponent {
  static name = null;
  static id = null;
  static label = null;
  static fields = [];

  static makeEntityComponent(overrides) {
    const defaults = {};

    this.fields.forEach(({ name, default: defaultValue }) => {
      defaults[name] = defaultValue;
    });

    return {
      name: this.name,
      fields: {
        ...defaults,
        ...overrides,
      },
    };
  }
}
