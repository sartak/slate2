import { canonicalizeFieldValue } from '../project/types';

export default class InspectorDebugger {
  selectedEntity = null;
  selectedEntityIndex = null;
  entity = null;
  indexForEntity = null;
  components = null;
  inspector = null;
  fieldCache = null;

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

  attachInspector(inspector) {
    this.inspector = inspector;
    const fieldCache = this.fieldCache = {};

    inspector.querySelectorAll('div.InspectEntityComponent').forEach((componentContainer) => {
      const {componentName} = componentContainer.dataset;
      const componentCache = fieldCache[componentName] = {};
      componentContainer.querySelectorAll(`li.field`).forEach((fieldContainer) => {
        const {fieldName} = fieldContainer.dataset;
        const input = fieldContainer.querySelector('input');
        if (input) {
          componentCache[fieldName] = input;
        }
      });
    });
  }

  detachInspector() {
    this.inspector = null;
    this.fieldCache = null;
  }

  updateEnd() {
    const { entity, fieldCache, components } = this;

    if (!entity || !fieldCache) {
      return;
    }

    components.forEach((component) => {
      const componentCache = fieldCache[component.constructor.name];
      if (!componentCache) {
        return;
      }

      component.constructor.fields.forEach(({ name }) => {
        const input = componentCache[name];
        if (input) {
          const value = component[name][entity];
          input.value = value;
        }
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

  inspectorEntityComponentUpdate(entityIndex, componentName, fieldName, value) {
    const { selectedEntityIndex, entity, components, fieldCache } = this;
    if (entityIndex !== selectedEntityIndex) {
      return;
    }

    components.forEach((component) => {
      if (component.constructor.name === componentName) {
        const componentCache = fieldCache[componentName];
        component.constructor.fields.forEach((field) => {
          if (field.name === fieldName) {
            const input = componentCache[fieldName];
            input.value = value;
            value = canonicalizeFieldValue(field, value);
            component[fieldName][entity] = value;
          }
        });
      }
    });
  }
};
