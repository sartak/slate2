export class BaseComponent {
  static name = null;
  static id = null;
  static label = null;
  static fields = [];

  id = null;
  label = null;

  static makeEntityComponent(overrides) {
    const defaults = {};

    this.fields.forEach(({ name, default: defaultValue }) => {
      defaults[name] = defaultValue;
    });

    return {
      name: this.name,
      id: this.id,
      fields: {
        ...defaults,
        ...overrides,
      },
    };
  }
}
