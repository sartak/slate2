import { newContext as __newContext } from './context';
import { assembleGameStep as __assembleGameStep } from './game';
import { assembleDebugCall as __assembleDebugCall, prepareDebuggers as __prepareDebuggers, assembleDebuggers as __assembleDebuggers } from './debug';
import { assembleECS as __assembleECS, prepareECS as __prepareECS } from './ecs';
import { selectEnabledSystems as __selectEnabledSystems } from '../project/selectors';
import { flattenList as __flattenList } from './inline';

const __assembleEvalCall = (codeVar, project, ctx) => {
  return [
    `console.log(${codeVar});`,

    `try {`,
      `console.log(eval(${codeVar}));`,
    `} catch (e) {`,
      `console.error(e.toString());`,
    `}`,
  ].join("\n");
};

const __assemblePreflightEval = (project, ctx) => {
  ctx.evalVar = '__codeToEval';

  ctx.cleanup.push((ctx) => [
    `(function () {`,
      `const __prevEval = ${ctx.evalVar};`,
      `${ctx.evalVar} = [];`,
      `__prevEval.forEach((__code) => {`,
        __assembleEvalCall('__code', project, ctx),
      `});`,
    `})();`,
  ].join("\n"));
};

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

  if (!ctx.render.length) {
    ctx.render.push((ctx) => (
      `${ctx.rendererVar}.beginRender();`
    ));
  }

  ctx.render.push((ctx) => (
    `${ctx.rendererVar}.finishRender();`
  ));

  __assemblePreflightEval(project, ctx);

  const step = __assembleGameStep(project, ctx);
  ctx.preparedLoop = true;

  ctx.designMode = true;

  const initDesign = [
    ...__assembleDebugCall('initBegin', '();', project, ctx),
      ...ctx.init.map((fn) => fn(ctx)),
    ...__assembleDebugCall('initEnd', '();', project, ctx),
  ].join("\n");

  const renderDesign = [
    ...__assembleDebugCall('renderBegin', '();', project, ctx),
      ...ctx.render.map((fn) => fn(ctx)),
    ...__assembleDebugCall('renderEnd', '();', project, ctx),
  ].join("\n");
  
  const deinitDesign = [
    ...__assembleDebugCall('deinitBegin', '();', project, ctx),
      ...ctx.deinit.map((fn) => fn(ctx)),
    ...__assembleDebugCall('deinitEnd', '();', project, ctx),
  ].join("\n");

  ctx.designMode = false;

  const initPreflight = [
    ...__assembleDebugCall('initBegin', '();', project, ctx),
      ...ctx.init.map((fn) => fn(ctx)),
    ...__assembleDebugCall('initEnd', '();', project, ctx),
  ].join("\n");

  const deinitPreflight = [
    ...__assembleDebugCall('deinitBegin', '();', project, ctx),
      ...ctx.deinit.map((fn) => fn(ctx)),
    ...__assembleDebugCall('deinitEnd', '();', project, ctx),
  ].join("\n");

  const assembly = [
    `(${ctx.rendererVar}, [${ctx.debuggerVars.join(', ')}]) => {`,
      `let [${ctx.renderVars.join(', ')}] = [];`,
      `let ${ctx.evalVar} = [];`,
      ...ecs,
      ...debug,
      `return {`,
        `entities: ${ctx.entitiesVar},`,
        `components: ${ctx.componentsVar},`,
        `systems: ${ctx.systemsVar},`,
        `initDesign: () => { ${initDesign} },`,
        `initPreflight: () => { ${initPreflight} },`,
        `renderDesign: (dt, time) => { ${renderDesign} },`,
        `step: ${step},`,
        `deinitDesign: () => { ${deinitDesign} },`,
        `deinitPreflight: () => { ${deinitPreflight} },`,
        `scheduleEval: (code) => { ${ctx.evalVar}.push(code) },`,
        `immediateEval: (__code) => { ${__assembleEvalCall('__code', project, ctx)} },`,
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
