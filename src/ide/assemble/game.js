import { assembleECS, prepareECS } from './ecs';
import { assembleDebugCall, assembleDebuggers, prepareDebuggers } from './debug';
import { newContext } from './context';
import { flattenList } from './inline';

export const assembleGame = (project, ctx = newContext(project)) => {
  prepareInstantiateGame(project, ctx);
  prepareECS(project, ctx);
  prepareDebuggers(project, ctx);

  const assembly = [
    ...assembleImports(project, ctx),
    ...assembleECS(project, ctx),
    ...assembleDebuggers(project, ctx),
    ...assembleInstantiateGame(project, ctx),
  ];

  return flattenList(assembly).join("\n");
};

const prepareInstantiateGame = (project, ctx) => {
  ctx.imports.push([ctx.gameClass, 'game', true]);
  ctx.imports.push([ctx.rendererClass, `renderer/${project.renderer}`, true]);
  ctx.imports.push([ctx.loopClass, `loop`, true]);
};

const assembleImports = (project, ctx) => {
  return ctx.imports.map(([symbol, path, isDefault]) => (
    `import ${isDefault ? symbol : `{ ${symbol} }`} from '@slate2/${path}';`
  ));
};

const assembleGameInit = (project, ctx) => {
  return [
    '() => {',
      ...assembleDebugCall('initBegin', '();', project, ctx),
        ...ctx.init,
      ...assembleDebugCall('initBegin', '();', project, ctx),
    '}',
  ].join("\n");
};

export const assembleGameStep = (project, ctx) => {
  return [
    '(dt, time) => {',
    ...assembleDebugCall('frameBegin', '();', project, ctx),

      ...assembleDebugCall('updateBegin', '();', project, ctx),
        ...ctx.update,
      ...assembleDebugCall('updateEnd', '();', project, ctx),

      ...assembleDebugCall('renderBegin', '();', project, ctx),
        ...ctx.render,
      ...assembleDebugCall('renderEnd', '();', project, ctx),

    ...assembleDebugCall('frameEnd', '();', project, ctx),
    '}',
  ].join("\n");
};

export const assembleInstantiateGame = (project, ctx) => {
  return [
    `const ${ctx.rendererVar} = new ${ctx.rendererClass}();`,
    `let [${ctx.renderVars.join(', ')}] = [];`,

    `export default new ${ctx.gameClass}({`,
      `init: ${assembleGameInit(project, ctx)},`,
      `renderer: ${ctx.rendererVar},`,
      `loop: new ${ctx.loopClass}(`,
        `${assembleGameStep(project, ctx)},`,
      `),`,
    `});`,
  ];
}
