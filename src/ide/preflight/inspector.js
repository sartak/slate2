export default class InspectorDebugger {
  selectedEntity = null;
  selectedEntityIndex = null;
  entity = null;
  indexForEntity = null;
  components = null;

  didUpdateProject(prev, next) {
    const { indexForEntity } = this;

    const prevEntityIndex = prev?.selectedEntityIndex ?? -1;
    const nextEntityIndex = next?.selectedEntityIndex ?? -1;
    if (nextEntityIndex !== prevEntityIndex) {
      this.selectedEntityIndex = nextEntityIndex;
      this.selectedEntity = next.entities[nextEntityIndex];
      if (this.selectedEntity === -1 || !indexForEntity) {
        this.entity = null;
      } else {
        this.entity = this.indexForEntity[this.selectedEntity.__id];
      }
      return;
    }

    if (prev?.entities[prevEntityIndex] !== next?.entities[nextEntityIndex]) {
      // changed the entity who is currently selected
    }
  }

  didUpdateAssembly(project, { components }, { indexForEntity }) {
    this.components = components;
    this.indexForEntity = indexForEntity;
    if (this.selectedEntity) {
      this.entity = indexForEntity[this.selectedEntity.__id];
    } else {
      this.entity = null;
    }
  }

  updateEnd() {
    const { entity, components } = this;

    if (!entity) {
      return;
    }

    components.forEach((component) => {
      component.constructor.fields.forEach(({ name }) => {
        const value = component[name][entity];
      });
    });
  }

  entityComponentValuesForInspector(entityIndex, componentName) {
    const { selectedEntityIndex, entity, components } = this;
    if (entityIndex !== selectedEntityIndex) {
      return null;
    }

    const ret = {};
    components.forEach((component) => {
      if (component.constructor.name === componentName) {
        component.constructor.fields.forEach(({ name }) => {
          ret[name] = component[name][entity];
        });
      }
    });

    return ret;
  }
};
