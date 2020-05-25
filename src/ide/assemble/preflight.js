import { newContext as __newContext } from './context';
import { assembleGameStep as __assembleGameStep } from './game';
import { assembleDebugCall as __assembleDebugCall, prepareDebuggers as __prepareDebuggers, assembleDebuggers as __assembleDebuggers } from './debug';
import { assembleECS as __assembleECS, prepareECS as __prepareECS } from './ecs';
import { prepareCommand as __prepareCommand, assembleCommandSetup as __assembleCommandSetup } from './command';
import { selectEnabledSystems as __selectEnabledSystems } from '../project/selectors';
import { assembleInlineSystemCall as __assembleInlineSystemCall, flattenList as __flattenList } from './inline';
import { UserDefinedSystem as __UserDefinedSystem } from '../systems/user-defined';
import { RenderSystemId as __RenderSystemId } from '../systems/render';
import { lookupSystemWithId as __lookupSystemWithId } from '../ecs/systems';

const __assembleEvalCall = (codeVar, paramsVar, inputVar, project, ctx) => {
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
  ].join("\n");
};

const __assemblePreflightEval = (project, ctx) => {
  ctx.evalVar = '__codeToEval';

  ctx.cleanup.push((ctx) => [
    `(function () {`,
      `const __prevEval = ${ctx.evalVar};`,
      `${ctx.evalVar} = [];`,
      `__prevEval.forEach(([__code, __params, __input]) => {`,
        __assembleEvalCall('__code', '__params', '__input', project, ctx),
      `});`,
    `})();`,
  ].join("\n"));
};

const __assembleDesignAttachDetach = (project, ctx) => {
  const { attachListenerFn } = ctx;

  const attach = [
    `const ${attachListenerFn} = (event, callback) => {`,
      `/* do nothing */`,
    `};`,
  ].join("\n");

  return [attach, ''];
};

const __assemblePreflightAttachDetach = (project, ctx) => {
  const { attachListenerFn, detachCallbacksVar } = ctx;

  const attach = [
    `const ${attachListenerFn} = (event, callback) => {`,
      `${ctx.rendererVar}.addEventListener(event, callback);`,
      `${ctx.detachCallbacksVar}.push(() => {`,
        `${ctx.rendererVar}.removeEventListener(event, callback);`,
      `});`,
    `};`,
  ].join("\n");

  const detach = [
    `${ctx.detachCallbacksVar}.forEach((cb) => cb());`,
  ].join("\n");

  return [attach, detach];
};

const __assembleHitTest = (project, ctx) => {
  const { systemMap } = ctx;
  const id = __RenderSystemId;
  const { entitiesVar } = systemMap[id];
  const renderSystem = __lookupSystemWithId(project, id);
  const code = { file: renderSystem.constructor.sourceCode };

  const body = __assembleInlineSystemCall(renderSystem, 'hitTest', code, [entitiesVar, 'x', 'y', 'all'], project, ctx);

  return [
    `(x, y, all) => {`,
      `const __ret = ${body};`,
      `return __ret;`,
    `}`,
  ].join("\n");
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
    forPreflight: true,
  });

  __prepareECS(project, ctx);
  __prepareCommand(project, ctx);
  __prepareDebuggers(project, ctx);

  const ecs = __assembleECS(project, ctx);
  const command = __assembleCommandSetup(project, ctx);
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

  ctx.detachCallbacksVar = `${ctx.prefix}detachCallbacks`;

  const hitTest = __assembleHitTest(project, ctx);

  const [designAttach, designDetach] = __assembleDesignAttachDetach(project, ctx);
  const [preflightAttach, preflightDetach] = __assemblePreflightAttachDetach(project, ctx);

  const initDesign = [
    ...__assembleDebugCall('initBegin', '();', project, ctx),
      designAttach,
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
      designDetach,
    ...__assembleDebugCall('deinitEnd', '();', project, ctx),
  ].join("\n");

  const initPreflight = [
    ...__assembleDebugCall('initBegin', '();', project, ctx),
      preflightAttach,
      ...ctx.init.map((fn) => fn(ctx)),
    ...__assembleDebugCall('initEnd', '();', project, ctx),
  ].join("\n");

  const deinitPreflight = [
    ...__assembleDebugCall('deinitBegin', '();', project, ctx),
      ...ctx.deinit.map((fn) => fn(ctx)),
      preflightDetach,
    ...__assembleDebugCall('deinitEnd', '();', project, ctx),
  ].join("\n");

  const assembly = [
    `(${ctx.rendererVar}, [${ctx.debuggerVars.join(', ')}]) => {`,
      `let [${ctx.renderVars.join(', ')}] = [];`,
      `let ${ctx.evalVar} = [];`,
      `const ${ctx.detachCallbacksVar} = [];`,
      ...ecs,
      ...command,
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
        `scheduleEval: (code, params, input) => { ${ctx.evalVar}.push([code, params, input]) },`,
        `immediateEval: (__code, __params, __input) => { ${__assembleEvalCall('__code', '__params', '__input', project, ctx)} },`,
        `hitTest: ${hitTest},`,
      `};`,
    `}`,
  ];

  return [__flattenList(assembly).join("\n"), ctx];
};

const __evaluateGameForPreflight = (__project) => {
  const __systemClasses = {};
  __selectEnabledSystems(__project).forEach((__system) => {
    if (__system.userDefined) {
      // @Cleanup: we should pass functions that can pass config for
      // this constructor
      __systemClasses[__system.id] = __UserDefinedSystem.constructor;
    }
    else {
      __systemClasses[__system.id] = __system.constructor;
    }
  });

  const [__assembly, __context] = __assembleGameForPreflight(__project);
  return [eval(__assembly), __context, __assembly];
};

export { __evaluateGameForPreflight as evaluateGameForPreflight, __assembleGameForPreflight as assembleGameForPreflight };
