import { assembleECSSetup as __assembleECSSetup, assembleGameStep as __assembleGameStep, newContext as __newContext, debugCall as __debugCall } from './game';
import { selectEnabledSystems as __selectEnabledSystems } from '../project/selectors';

const __assembleGameForPreflight = (project, ctx = __newContext(project)) => {
  const ecsSetup = __assembleECSSetup(project, ctx);

  ctx.render.push(
    `${ctx.rendererVar}.finishRender();`,
  );

  const step = __assembleGameStep(project, ctx);

  const init = [
    __debugCall('initBegin', '();', project, ctx),
    ...ctx.init,
    __debugCall('initEnd', '();', project, ctx),
  ].join("\n");

  const render = [
    __debugCall('renderBegin', '();', project, ctx),
    ...ctx.render,
    __debugCall('renderEnd', '();', project, ctx),
  ].join("\n");
  
  return [
    `(${ctx.rendererVar}, [${ctx.debuggerVars}]) => {`,
      `let [${ctx.renderVars.join(', ')}] = [];`,
      ecsSetup,
      `return {`,
        `entities: ${ctx.entitiesVar},`,
        `components: ${ctx.componentsVar},`,
        `systems: ${ctx.systemsVar},`,
        `init: () => { ${init} },`,
        `render: (dt, time) => { ${render} },`,
        `step: ${step}`,
      `};`,
    `}`,
  ].join("\n");
};

const __evaluateGameForPreflight = (__project) => {
  const __context = __newContext(__project, {
    prefix: '__',
    systemClassPrefix: '__systemClasses.',
  });

  const __systemClasses = {};

  __selectEnabledSystems(__project).forEach((__system) => {
    __systemClasses[__system.label] = __system.constructor;
  });

  return [eval(__assembleGameForPreflight(__project, __context)), __context];
};

export { __evaluateGameForPreflight as evaluateGameForPreflight, __assembleGameForPreflight as assembleGameForPreflight };
