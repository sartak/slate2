import { makeSelectEntityComponents, makeSelectEntityComponentValue, lookupComponentWithId } from '../project/selectors';
import { changeEntityComponentValueAction } from '../project/actions';
import { canonicalizeValue } from '../types';

export const DESIGN_TIME = 'DESIGN_TIME';
export const PREFLIGHT_RUNNING = 'PREFLIGHT_RUNNING';
export const PREFLIGHT_STOPPING = 'PREFLIGHT_STOPPING';
export const PREFLIGHT_STOPPED = 'PREFLIGHT_STOPPED';

export default class LiveEntityValuesDebugger {
  project = null;
  dispatch = null;
  entityList = null;
  entityMap = null;
  components = null;
  preflightRunning = false;
  componentsSubscriptions = [];
  valueSubscriptions = [];

  registerDispatch(dispatch) {
    this.dispatch = dispatch;
  }

  didUpdateProject(prev, next) {
    this.project = next;
    this.entityList = next?.entities;
  }

  didUpdateAssembly(project, assembly, context) {
    this.components = assembly.components;
    this.entityMap = context.entityMap;
  }

  entityForEntityIndex(entityIndex) {
    const { id } = this.entityList[entityIndex];
    return this.entityMap[id].index;
  }

  publishAssemblyValues(mode) {
    const { valueSubscriptions, componentsSubscriptions, components } = this;

    valueSubscriptions.forEach(([callback, entityIndex, componentId, fieldId]) => {
      const entity = this.entityForEntityIndex(entityIndex);
      const value = components[componentId][fieldId][entity];
      callback(mode, value);
    });

    componentsSubscriptions.forEach(([callback, entityIndex, componentIds]) => {
      const entity = this.entityForEntityIndex(entityIndex);

      const componentValues = componentIds.map((componentId) => {
        const fieldValues = {};

        Object.entries(components[componentId]).forEach(([fieldId, values]) => {
          const value = values[entity];
          fieldValues[fieldId] = value;
        });

        return fieldValues;
      });

      callback(mode, ...componentValues);
    });
  }

  publishDesignValues(mode) {
    const { valueSubscriptions, componentsSubscriptions, project } = this;

    valueSubscriptions.forEach(([callback, entityIndex, componentId, fieldId]) => {
      const selector = makeSelectEntityComponentValue(entityIndex, componentId, fieldId);
      const value = selector(project);

      callback(mode, value);
    });

    componentsSubscriptions.forEach(([callback, entityIndex, componentIds]) => {
      const selector = makeSelectEntityComponents(entityIndex, componentIds);
      const entityComponents = selector(project);

      callback(mode, ...entityComponents.map(({ values }) => values));
    });
  }

  changeEntityComponentValueDesign(entityIndex, componentId, fieldId, value) {
    this.dispatch(changeEntityComponentValueAction(entityIndex, componentId, fieldId, value));
  }

  changeEntityComponentValuePreflight(entityIndex, componentId, fieldId, value) {
    const { components, project } = this;

    const component = lookupComponentWithId(project, componentId);
    const field = component.fieldWithId(fieldId);
    const { defaultValue, type } = field;

    const entity = this.entityForEntityIndex(entityIndex);

    components[componentId][fieldId][entity] = canonicalizeValue(type, value, defaultValue);
  }

  changeEntityComponentValue(...args) {
    if (this.preflightRunning) {
      this.changeEntityComponentValuePreflight(...args);
    } else {
      this.changeEntityComponentValueDesign(...args);
    }
  }

  updateEnd() {
    this.publishAssemblyValues(PREFLIGHT_RUNNING);
  }

  preflightStart() {
    this.preflightRunning = true;
  }

  preflightStop() {
    this.preflightRunning = false;
    this.publishAssemblyValues(PREFLIGHT_STOPPING);
    this.publishDesignValues(PREFLIGHT_STOPPED);
  }

  subscribeValue(callback, entityIndex, componentId, fieldId) {
    const subscription = [callback, entityIndex, componentId, fieldId];
    this.valueSubscriptions.push(subscription);

    return () => {
      this.valueSubscriptions = this.valueSubscriptions.filter((s) => s !== subscription);
    };
  }

  subscribeComponents(callback, entityIndex, componentIds) {
    const subscription = [callback, entityIndex, componentIds];
    this.componentsSubscriptions.push(subscription);

    return () => {
      this.componentsSubscriptions = this.componentsSubscriptions.filter((s) => s !== subscription);
    };
  }
}
