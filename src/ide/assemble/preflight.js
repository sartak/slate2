import { assembleECSSetup as __assembleECSSetup, assembleGameStep as __assembleGameStep, newContext as __newContext, debugCall as __debugCall } from './game';
import { ComponentByClassName as __ComponentClasses, SystemByClassName as __SystemClasses } from '../project/ecs';

const __assembleGameForPreflight = (project, overrides) => {
  const context = __newContext(project, {
    prefix: '__',
    componentClassPrefix: '__componentClasses.',
    systemClassPrefix: '__systemClasses.',
  });
  const ecsSetup = __assembleECSSetup(project, context);

  context.render.push(
    `${context.rendererVar}.finishRender();`,
  );

  const step = __assembleGameStep(project, context);

  const render = [
    __debugCall('renderBegin', '();', project, context),
    ...context.render,
    __debugCall('renderEnd', '();', project, context),
  ].join("\n");
  
  return [
    `(${context.rendererVar}, [${context.debuggerVars}]) => {`,
      ecsSetup,
      `return {`,
        `entities: ${context.entitiesVar},`,
        `components: ${context.componentsVar},`,
        `systems: ${context.systemsVar},`,
        `init: () => { ${context.init.join("\n")} },`,
        `render: (dt, time) => { ${render} },`,
        `step: ${step}`,
      `};`,
    `}`,
  ].join("\n");
};

const __evaluateGameForPreflight = (__project, __overrides) => {
  const __componentClasses = __ComponentClasses;
  const __systemClasses = __SystemClasses;
  return eval(__assembleGameForPreflight(__project, __overrides));
};

export { __evaluateGameForPreflight as evaluateGameForPreflight, __assembleGameForPreflight as assembleGameForPreflight };
