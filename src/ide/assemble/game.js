import { assembleECS, prepareECS } from './ecs';
import { assembleDebugCall, assembleDebuggers, prepareDebuggers } from './debug';
import { prepareCommand, assembleCommandSetup, assembleCommandStepPrepare } from './command';
import { newContext } from './context';
import { flattenList } from './inline';
import { parseSync } from '@babel/core';

export const assembleGame = (project, ctx = newContext(project)) => {
  prepareECS(project, ctx);
  prepareCommand(project, ctx);
  prepareInstantiateGame(project, ctx);
  prepareDebuggers(project, ctx);

  const assembly = [
    ...assembleECS(project, ctx),
    ...assembleCommandSetup(project, ctx),
    ...assembleDebuggers(project, ctx),
    ...assembleInstantiateGame(project, ctx),
  ];

  assembly.unshift(assembleImports(project, ctx));

  const code = flattenList(assembly).join("\n");
  parseSync(code); // get better error from babel
  return code;
};

const prepareInstantiateGame = (project, ctx) => {
  const { gameClass } = ctx;

  ctx.imports.push([gameClass, 'game', true]);

  ctx.init.unshift((ctx) => {
    const { attachListenerFn } = ctx;
    return [
      `const ${attachListenerFn} = (event, callback) => {`,
        `${ctx.rendererVar}.addEventListener(event, callback);`,
      `};`,
    ].join("\n");
  });
};

const assembleImports = (project, ctx) => {
  if (ctx.preparedRenderer) {
    ctx.imports.push([ctx.rendererClass, `renderer/${ctx.renderer}`, true]);
  }

  if (ctx.preparedLoop) {
    ctx.imports.push([ctx.loopClass, `loop`, true]);
  }

  return ctx.imports.map(([symbol, path, isDefault]) => (
    `import ${isDefault ? symbol : `{ ${symbol} }`} from '@slate2/${path}';`
  ));
};

const assembleGameInit = (project, ctx) => {
  const calls = [
    ...assembleDebugCall('initBegin', '();', project, ctx),
      ...ctx.init.map((fn) => fn(ctx)),
    ...assembleDebugCall('initBegin', '();', project, ctx),
  ].filter(Boolean);

  if (!calls.length) {
    return null;
  }

  return [
    '() => {',
      ...calls,
    '}',
  ].join("\n");
};

export const assembleGameStep = (project, ctx) => {
  const step = [
    ...assembleDebugCall('frameBegin', '();', project, ctx),

      ...assembleDebugCall('updateBegin', '();', project, ctx),

        ...assembleDebugCall('inputBegin', '();', project, ctx),
          ...assembleCommandStepPrepare(project, ctx),
          ...ctx.input.map((fn) => fn(ctx)),
        ...assembleDebugCall('inputEnd', `();`, project, ctx),

        ...ctx.update.map((fn) => fn(ctx)),
      ...assembleDebugCall('updateEnd', '();', project, ctx),

      ...assembleDebugCall('renderBegin', '();', project, ctx),
        ...ctx.render.map((fn) => fn(ctx)),
      ...assembleDebugCall('renderEnd', '();', project, ctx),

      ...assembleDebugCall('cleanupBegin', '();', project, ctx),
        ...ctx.cleanup.map((fn) => fn(ctx)),
      ...assembleDebugCall('cleanupEnd', '();', project, ctx),

    ...assembleDebugCall('frameEnd', '();', project, ctx),
  ].filter(Boolean);

  if (!step.length) {
    return null;
  }

  return [
    '(dt, time) => {',
      ...step,
    '}',
  ].join("\n");
};

export const assembleInstantiateGame = (project, ctx) => {
  const init = assembleGameInit(project, ctx);
  const step = assembleGameStep(project, ctx);

  if (step) {
    ctx.preparedLoop = true;
  }

  return [
    ...(ctx.preparedRenderer ? [
      `const ${ctx.rendererVar} = new ${ctx.rendererClass}();`,
      `let [${ctx.renderVars.join(', ')}] = [];`,
    ] : []),

    `export default new ${ctx.gameClass}({`,
      `width: ${project.width},`,
      `height: ${project.height},`,
      (init && `init: ${init},`),
      (ctx.preparedRenderer && `renderer: ${ctx.rendererVar},`),
      ...(step ? [
        `loop: new ${ctx.loopClass}(`,
          `${step},`,
        `),`,
      ] : []),
    `});`,
  ];
}
