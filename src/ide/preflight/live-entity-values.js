import { makeSelectEntityComponents, makeSelectEntityComponentValue } from '../project/selectors';
import { lookupComponentWithId } from '../ecs/components';
import { changeEntityComponentValueAction } from '../project/actions';
import { canonicalizeValue } from '../types';

export const DESIGN_TIME = 'DESIGN_TIME';
export const PREFLIGHT_RUNNING = 'PREFLIGHT_RUNNING';
export const PREFLIGHT_STOPPING = 'PREFLIGHT_STOPPING';
export const PREFLIGHT_STOPPED = 'PREFLIGHT_STOPPED';

export default class LiveEntityValuesDebugger {
  label = "live_entity_values";
  project = null;
  dispatch = null;
  assembly = null;
  entityMap = null;
  preflightRunning = false;
  componentsSubscriptions = [];
  valueSubscriptions = [];

  registerDispatch(dispatch) {
    this.dispatch = dispatch;
  }

  didUpdateProject(prev, next) {
    this.project = next;
  }

  didUpdateAssembly(project, assembly) {
    this.assembly = assembly;
    this.entityMap = assembly.context.entityMap;
  }

  entityForEntityId(id) {
    return this.entityMap[id].index;
  }

  prepareAssembly(map, project, ctx) {
    ctx.entityValueUpdatesVar = `${ctx.prefix}entityValueUpdates`;
  }

  assemblePreflightInit(map, project, ctx) {
    return [
      `let ${ctx.entityValueUpdatesVar} = [];`,
    ];
  }

  assemble_updateBegin(map, project, ctx) {
    const { entityValueUpdatesVar, assembleCaptureEmitFn, componentsVar } = ctx;

    return [
      `(function () {`,
        ...assembleCaptureEmitFn(
          'entityValueUpdates',
          entityValueUpdatesVar,
          (val) => [`${entityValueUpdatesVar} = ${val};`],
        ),
        `${entityValueUpdatesVar}.forEach(([componentId, fieldId, entity, value]) => {`,
          `${componentsVar}[componentId][fieldId][entity] = value;`,
        `});`,
        `${entityValueUpdatesVar} = [];`,
      `})();`,
    ];
  }

  assemblePreflightReturn(map, project, ctx) {
    const { entityValueUpdatesVar } = ctx;
    return [
      `pushEntityValueUpdate: (componentId, fieldId, entity, value) => {`,
        `${entityValueUpdatesVar}.push([componentId, fieldId, entity, value]);`,
      `},`,
    ];
  }

  publishAssemblyValues(mode) {
    const { valueSubscriptions, componentsSubscriptions, assembly } = this;
    const { components } = assembly;

    valueSubscriptions.forEach(([callback, entityId, componentId, fieldId]) => {
      const entity = this.entityForEntityId(entityId);
      const value = components[componentId][fieldId][entity];
      callback(mode, value);
    });

    componentsSubscriptions.forEach(([callback, entityId, componentIds]) => {
      const entity = this.entityForEntityId(entityId);

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

    valueSubscriptions.forEach(([callback, entityId, componentId, fieldId]) => {
      const selector = makeSelectEntityComponentValue(entityId, componentId, fieldId);
      const value = selector(project);

      callback(mode, value);
    });

    componentsSubscriptions.forEach(([callback, entityId, componentIds]) => {
      const selector = makeSelectEntityComponents(entityId, componentIds);
      const entityComponents = selector(project);

      callback(mode, ...entityComponents.map(({ values }) => values));
    });
  }

  changeEntityComponentValueDesign(entityId, componentId, fieldId, value) {
    this.dispatch(changeEntityComponentValueAction(entityId, componentId, fieldId, value));
  }

  changeEntityComponentValuePreflight(entityId, componentId, fieldId, value) {
    const { project, assembly } = this;

    const component = lookupComponentWithId(project, componentId);
    const field = component.fieldWithId(fieldId);
    const { defaultValue, type } = field;

    const entity = this.entityForEntityId(entityId);

    const canonicalized = canonicalizeValue(type, value, defaultValue);
    assembly.pushEntityValueUpdate(componentId, fieldId, entity, canonicalized);
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

  subscribeValue(callback, entityId, componentId, fieldId) {
    const subscription = [callback, entityId, componentId, fieldId];
    this.valueSubscriptions.push(subscription);

    return () => {
      this.valueSubscriptions = this.valueSubscriptions.filter((s) => s !== subscription);
    };
  }

  subscribeComponents(callback, entityId, componentIds) {
    const subscription = [callback, entityId, componentIds];
    this.componentsSubscriptions.push(subscription);

    return () => {
      this.componentsSubscriptions = this.componentsSubscriptions.filter((s) => s !== subscription);
    };
  }
}
