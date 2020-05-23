import { selectActiveTypeId } from '../project/selectors';

export default class EvalDebugger {
  project = null;
  assembly = null;
  preflightRunning = false;

  prepareParams() {
    const { project, assembly } = this;
    const { context, entities, components, systems } = assembly;
    const { entityMap, componentObjects } = context;

    const [activeType, activeId] = selectActiveTypeId(project);

    let $c = null;
    const $cm = {};
    componentObjects.forEach((component) => {
      const { id: componentId, label: componentLabel, fields } = component;
      const fieldsByLabel = $cm[componentLabel] = {};
      const fieldsById = components[componentId];

      component.fields.forEach(({ id, label }) => {
        fieldsByLabel[label ?? id] = fieldsById[id];
      });

      if (activeType === 'Component' && activeId === componentId) {
        $c = fieldsByLabel;
      }
    });

    const $sm = {};
    Object.entries(systems).forEach(([id, system]) => {
      $sm[system.label] = system;
    });

    return {
      $e: activeType === 'Entity' ? entityMap[activeId].index : null,
      $c,
      $s: activeType === 'System' ? systems[activeId] : null,

      $es: entities,
      $cm,
      $sm,

      $project: project,
      $assembly: assembly,
      $context: context,
    };
  }

  prepareCode(input) {
    return input;
  }

  eval(input) {
    const { assembly, preflightRunning } = this;

    const params = this.prepareParams();
    const code = this.prepareCode(input);

    if (preflightRunning) {
      assembly.scheduleEval(code, params, input);
    } else {
      assembly.immediateEval(code, params, input);
    }
  }

  didUpdateProject(prev, next) {
    this.project = next;
  }

  didUpdateAssembly(project, assembly) {
    this.assembly = assembly;
  }

  preflightStart() {
    this.preflightRunning = true;
  }

  preflightStop() {
    this.preflightRunning = false;
  }
}
