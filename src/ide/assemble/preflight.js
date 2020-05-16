import { assembleECSSetup as __assembleECSSetup, newContext as __newContext } from './game';
import { ComponentByClassName as __ComponentClasses, SystemByClassName as __SystemClasses } from '../project/ecs';

const __assembleGameForPreflight = (project) => {
  const context = __newContext(project, {
    prefix: '__',
    componentClassPrefix: '__componentClasses.',
    systemClassPrefix: '__systemClasses.',
  });
  const ecsSetup = __assembleECSSetup(project, context);

  context.render.push(
    `${context.rendererVar}.finishRender();`,
  );
  
  return [
    `(${context.rendererVar}) => {`,
      ecsSetup,
      `return {`,
        `entities: ${context.entitiesVar},`,
        `components: ${context.componentsVar},`,
        `systems: ${context.systemsVar},`,
        `init: () => { ${context.init.join("\n")} },`,
        `update: (dt, time) => { ${context.update.join("\n")} },`,
        `render: (dt, time) => { ${context.render.join("\n")} },`,
      `};`,
    `}`,
  ].join("\n");
};

const __evaluateGameForPreflight = (__project) => {
  const __componentClasses = __ComponentClasses;
  const __systemClasses = __SystemClasses;
  return eval(__assembleGameForPreflight(__project));
};

export { __evaluateGameForPreflight as evaluateGameForPreflight, __assembleGameForPreflight as assembleGameForPreflight };
