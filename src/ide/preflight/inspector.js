import { canonicalizeValue } from '../types';

export default class InspectorDebugger {
  selectedEntity = null;
  selectedEntityIndex = null;
  entityIndex = null;
  entityMap = null;
  components = null;
  inspector = null;
  fieldCache = null;

  didUpdateProject(prev, next) {
    const { entityMap } = this;

    const prevEntityIndex = prev?.selectedEntityIndex ?? -1;
    const nextEntityIndex = next?.selectedEntityIndex ?? -1;
    if (nextEntityIndex !== prevEntityIndex) {
      this.selectedEntityIndex = nextEntityIndex;
      this.selectedEntity = next.entities[nextEntityIndex];
      if (this.selectedEntity && entityMap && entityMap[this.selectedEntity.id]) {
        this.entity = entityMap[this.selectedEntity.id].index;
      } else {
        this.entity = null;
      }
      return;
    }

    if (prev?.entities[prevEntityIndex] !== next?.entities[nextEntityIndex]) {
      // changed the entity who is currently selected
    }
  }

  didUpdateAssembly(project, assembly, context) {
    this.components = assembly.components;
    this.entityMap = context.entityMap;
    if (this.selectedEntity && this.entityMap && this.entityMap[this.selectedEntity.id]) {
      this.entity = this.entityMap[this.selectedEntity.id].index;
    } else {
      this.entity = null;
    }
  }

  didCleanAssemblyScope(assembly) {
    this.components = assembly.components;
  }

  attachInspector(inspector) {
    this.inspector = inspector;
    const fieldCache = this.fieldCache = {};

    inspector.querySelectorAll('div.InspectEntityComponent').forEach((componentContainer) => {
      const {componentId} = componentContainer.dataset;
      const componentCache = fieldCache[componentId] = {};
      componentContainer.querySelectorAll(`li.field`).forEach((fieldContainer) => {
        const {fieldId} = fieldContainer.dataset;
        const input = fieldContainer.querySelector('input');
        if (input) {
          componentCache[fieldId] = input;
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

    const { activeElement } = document;

    Object.entries(components).forEach(([componentId, fields]) => {
      const componentCache = fieldCache[componentId];
      if (!componentCache) {
        return;
      }

      Object.entries(fields).forEach(([fieldId, values]) => {
        const input = componentCache[fieldId];
        if (input && input !== activeElement) {
          input.value = values[entity];
        }
      });
    });
  }

  entityComponentValuesForInspector(entityIndex, componentId) {
    const { selectedEntityIndex, entity, components } = this;
    if (entityIndex !== selectedEntityIndex) {
      return null;
    }

    const ret = {};
    Object.entries(components[componentId]).forEach(([fieldId, values]) => {
      ret[fieldId] = values[entity];
    });

    return ret;
  }

  inspectorEntityComponentUpdate(entityIndex, component, field, input, value) {
    const { selectedEntityIndex, entity, components } = this;
    if (entityIndex !== selectedEntityIndex) {
      return;
    }

    const { id: fieldId, type, defaultValue } = field;

    input.value = value;
    components[component.id][fieldId][entity] = canonicalizeValue(type, value, defaultValue);
  }
};
