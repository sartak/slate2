export class BaseComponent {
  id = null;
  label = null;
  fields = [];

  makeEntityComponent(overrides) {
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
