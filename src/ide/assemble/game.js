import { assembleECS, prepareECS } from './ecs';
import { assembleDebugCall, assembleDebuggers, prepareDebuggers } from './debug';
import { newContext } from './context';
import { flattenList } from './inline';

export const assembleGame = (project, ctx = newContext(project)) => {
  prepareECS(project, ctx);
  prepareInstantiateGame(project, ctx);
  prepareDebuggers(project, ctx);

  const assembly = [
    ...assembleECS(project, ctx),
    ...assembleDebuggers(project, ctx),
    ...assembleInstantiateGame(project, ctx),
  ];

  assembly.unshift(assembleImports(project, ctx));

  return flattenList(assembly).join("\n");
};

const prepareInstantiateGame = (project, ctx) => {
  ctx.imports.push([ctx.gameClass, 'game', true]);
};

const assembleImports = (project, ctx) => {
  if (ctx.preparedRenderer) {
    ctx.imports.push([ctx.rendererClass, `renderer/${project.renderer}`, true]);
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
        ...ctx.input.map((fn) => fn(ctx)),
        ...ctx.update.map((fn) => fn(ctx)),
      ...assembleDebugCall('updateEnd', '();', project, ctx),

      ...assembleDebugCall('renderBegin', '();', project, ctx),
        ...ctx.render.map((fn) => fn(ctx)),
      ...assembleDebugCall('renderEnd', '();', project, ctx),

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
