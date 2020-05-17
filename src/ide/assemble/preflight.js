import { newContext as __newContext } from './context';
import { assembleGameStep as __assembleGameStep } from './game';
import { assembleDebugCall as __assembleDebugCall, prepareDebuggers as __prepareDebuggers, assembleDebuggers as __assembleDebuggers } from './debug';
import { assembleECS as __assembleECS, prepareECS as __prepareECS } from './ecs';
import { selectEnabledSystems as __selectEnabledSystems } from '../project/selectors';
import { flattenList as __flattenList } from './inline';

const __assembleGameForPreflight = (originalProject) => {
  const project = {
    ...originalProject,
    generateComponentVars: true,
    generateSystemVars: true,
    generateDebuggerVars: false,
  };

  const ctx = __newContext(project, {
    prefix: '__',
    systemClassPrefix: '__systemClasses.',
  });

  __prepareECS(project, ctx);
  __prepareDebuggers(project, ctx);

  const ecs = __assembleECS(project, ctx);
  const debug = __assembleDebuggers(project, ctx);
  const step = __assembleGameStep(project, ctx);

  ctx.render.push(
    `${ctx.rendererVar}.finishRender();`,
  );

  const init = [
    ...__assembleDebugCall('initBegin', '();', project, ctx),
      ...ctx.init,
    ...__assembleDebugCall('initEnd', '();', project, ctx),
  ].join("\n");

  const render = [
    ...__assembleDebugCall('renderBegin', '();', project, ctx),
      ...ctx.render,
    ...__assembleDebugCall('renderEnd', '();', project, ctx),
  ].join("\n");
  
  const assembly = [
    `(${ctx.rendererVar}, [${ctx.debuggerVars.join(', ')}]) => {`,
      `let [${ctx.renderVars.join(', ')}] = [];`,
      ...ecs,
      ...debug,
      `return {`,
        `entities: ${ctx.entitiesVar},`,
        `components: ${ctx.componentsVar},`,
        `systems: ${ctx.systemsVar},`,
        `init: () => { ${init} },`,
        `render: (dt, time) => { ${render} },`,
        `step: ${step},`,
      `};`,
    `}`,
  ];

  return [__flattenList(assembly).join("\n"), ctx];
};

const __evaluateGameForPreflight = (__project) => {
  const __systemClasses = {};
  __selectEnabledSystems(__project).forEach((__system) => {
    __systemClasses[__system.id] = __system.constructor;
  });

  const [__assembly, __context] = __assembleGameForPreflight(__project);
  return [eval(__assembly), __context];
};

export { __evaluateGameForPreflight as evaluateGameForPreflight, __assembleGameForPreflight as assembleGameForPreflight };
