import { makeSelectEntityComponents } from '../project/selectors';

export const DESIGN_TIME = 'DESIGN_TIME';
export const PREFLIGHT_RUNNING = 'PREFLIGHT_RUNNING';
export const PREFLIGHT_STOPPING = 'PREFLIGHT_STOPPING';
export const PREFLIGHT_STOPPED = 'PREFLIGHT_STOPPED';

export default class LiveEntityValuesDebugger {
  project = null;
  entityList = null;
  entityMap = null;
  components = null;
  subscriptions = [];

  didUpdateProject(prev, next) {
    this.project = next;
    this.entityList = next?.entities;
  }

  didUpdateAssembly(project, assembly, context) {
    this.components = assembly.components;
    this.entityMap = context.entityMap;
  }

  didCleanAssemblyScope(assembly) {
    this.components = assembly.components;
  }

  entityForEntityIndex(entityIndex) {
    const { id } = this.entityList[entityIndex];
    return this.entityMap[id].index;
  }

  publishAssemblyValues(mode) {
    const { subscriptions, components } = this;

    subscriptions.forEach(([callback, entityIndex, componentIds]) => {
      const entity = this.entityForEntityIndex(entityIndex);

      const componentValues = componentIds.map((componentId) => {
        const fieldValues = {};

        Object.entries(components[componentId]).forEach(([fieldName, values]) => {
          const value = values[entity];
          fieldValues[fieldName] = value;
        });

        return fieldValues;
      });

      callback(mode, ...componentValues);
    });
  }

  publishDesignValues(mode) {
    const { subscriptions, project } = this;

    subscriptions.forEach(([callback, entityIndex, componentIds]) => {
      const selector = makeSelectEntityComponents(entityIndex, componentIds);
      const entityComponents = selector(project);

      callback(mode, ...entityComponents.map(({ values }) => values));
    });
  }

  updateEnd() {
    this.publishAssemblyValues(PREFLIGHT_RUNNING);
  }

  preflightStopped() {
    this.publishAssemblyValues(PREFLIGHT_STOPPING);
    this.publishDesignValues(PREFLIGHT_STOPPED);
  }

  subscribe(callback, entityIndex, componentIds) {
    const subscription = [callback, entityIndex, componentIds];
    this.subscriptions.push(subscription);

    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
    };
  }
}
