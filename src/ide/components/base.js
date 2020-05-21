export class BaseComponent {
  id = null;
  label = null;
  fields = [];

  fieldWithId(target) {
    return this.fields.find(({ id }) => id === target);
  }

  fieldWithLabel(target) {
    return this.fields.find(({ label, id }) => (label || id) === target);
  }

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
