import { selectActiveTypeId } from '../project/selectors';
import { rewriteCodeToUseComponentVariables } from '../assemble/inline';

export default class EvalDebugger {
  label = "eval";
  project = null;
  assembly = null;
  preflightRunning = false;

  prepareAssembly(map, project, ctx) {
    ctx.evalVar = `${ctx.prefix}codeToEval`;
  }

  assemblePreflightInit(map, project, ctx) {
    return [
      `let ${ctx.evalVar} = [];`,
    ];
  }

  assembleEvalCall(codeVar, paramsVar, inputVar) {
    return [
      `console.s2_eval_input(${inputVar});`,

      `Object.keys(${paramsVar}).forEach((varName) => {`,
        `${codeVar} = \`const \${varName} = ${paramsVar}["\${varName}"]; \${${codeVar}}\`;`,
      `});`,

      `try {`,
        `console.s2_eval_result(eval(${codeVar}));`,
      `} catch (e) {`,
        `console.s2_eval_error(e.toString());`,
      `}`,
    ];
  }

  assemble_cleanupEnd(map, project, ctx) {
    const { varName: debuggerVar } = map;
    const { evalVar, assembleCaptureEmitFn } = ctx;
    const prevEvalVar = `${evalVar}_prev`;
    const codeVar = `${ctx.prefix}code`;
    const paramsVar = `${ctx.prefix}params`;
    const inputVar = `${ctx.prefix}input`;

    return [
      `(function () {`,
        ...assembleCaptureEmitFn(
          'evals',
          `${evalVar}.map(([code, params, input]) => input)`,
          (val) => {
            return [
              `${evalVar} = ${val}.map((input) => {`,
                `const code = ${debuggerVar}.preprocessCodeForEval(input);`,
                `const params = ${debuggerVar}.paramsForEval();`,
                `return [code, params, input];`,
              `});`,
            ];
          },
        ),
        `const ${prevEvalVar} = ${evalVar};`,
        `${evalVar} = [];`,
        `${prevEvalVar}.forEach(([${[codeVar, paramsVar, inputVar].join(", ")}]) => {`,
          ...this.assembleEvalCall(codeVar, paramsVar, inputVar),
        `});`,
      `})();`,
    ];
  }

  assemblePreflightReturn(map, project, ctx) {
    const codeVar = `${ctx.prefix}code`;
    const paramsVar = `${ctx.prefix}params`;
    const inputVar = `${ctx.prefix}input`;

    return [
      `scheduleEval: (${[codeVar, paramsVar, inputVar].join(", ")}) => {`,
        `${ctx.evalVar}.push([${[codeVar, paramsVar, inputVar].join(", ")}]);`,
      `},`,

      `immediateEval: (${[codeVar, paramsVar, inputVar].join(", ")}) => {`,
        ...this.assembleEvalCall(codeVar, paramsVar, inputVar),
      `},`,
    ];
  }

  paramsForEval() {
    const { project, assembly } = this;
    const { context, entities, components, systems, entityIndexLookup } = assembly;
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
      $e: activeType === 'Entity' ? entityMap[activeId].id : null,
      $c,
      $s: activeType === 'System' ? systems[activeId] : null,

      $es: entities,
      $cm,
      $sm,

      $project: project,
      $assembly: assembly,
      $context: context,

      $cel: (componentLabel, entityId) => {
        // There's a chance of false positives, since the pattern
        // is just .ComponentName
        if (!entityIndexLookup.hasOwnProperty(entityId)) {
          return entityId[componentLabel];
        }

        const entityIndex = entityIndexLookup[entityId];

        const component = $cm[componentLabel];
        const out = {};
        Object.entries(component).forEach(([fieldLabel, values]) => {
          out[fieldLabel] = values[entityIndex];
        });

        return out;
      },
    };
  }

  preprocessCodeForEval(input) {
    const { assembly } = this;
    const { context } = assembly;
    const { componentObjects } = context;

    try {
      return rewriteCodeToUseComponentVariables(input, componentObjects, '$cel', context);
    } catch (e) {
      console.s2_eval_input(input);
      console.s2_eval_error(e.toString());
      return null;
    }
  }

  eval(input) {
    const { assembly, preflightRunning } = this;

    const params = this.paramsForEval();
    const code = this.preprocessCodeForEval(input);

    if (code === null) {
      return;
    }

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
