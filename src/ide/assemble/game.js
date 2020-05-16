import { ComponentByName, Systems } from '../project/ecs';
import { canonicalizeFieldValue, fieldZeroValue } from '../project/types';
import { assembleInlineSystemCall } from './inline';

export const newContext = (project, overrides = {}) => {
  const prefix = 'prefix' in overrides ? overrides.prefix : '__';

  const renderVarsForRenderer = {
    'canvas': [`${prefix}ctx`],
    'webgl': [`${prefix}ctx`],
    'webgpu': [`${prefix}ctx`],
  };

  const renderVars = renderVarsForRenderer[project.renderer];
  return {
    prefix,
    imports: [],
    init: [],
    update: [],
    render: [],
    renderVars,
    debuggerVars: (project.debuggers || []).map((_, i) => `${prefix}debugger${i}`),
    entitiesVar: `${prefix}allEntities`,
    componentsVar: `${prefix}allComponents`,
    systemsVar: `${prefix}allSystems`,
    gameClass: `${prefix}Game`,
    rendererClass: `${prefix}Renderer`,
    rendererVar: `${prefix}renderer`,
    loopClass: `${prefix}Loop`,
    componentFieldVars: {},
    componentClassPrefix: prefix,
    systemClassPrefix: prefix,

    ...overrides,
  };
};

export const assembleGame = (project, ctx = newContext(project)) => {
  const ecs = assembleECSSetup(project, ctx);
  const debug = (project.debuggers || []).length ? assembleDebuggers(project, ctx) : "";
  const game = assembleInstantiateGame(project, ctx);
  const imports = assembleImports(project, ctx);
  return [imports, ecs, debug, game].join("\n");
};

export const assembleImports = (project, ctx = newContext(project)) => {
  return `
    ${ctx.imports.map(([symbol, path, isDefault]) => `import ${isDefault ? symbol : `{ ${symbol} }`} from '@slate2/${path}';\n`).join("")}
  `;
};

export const debugCall = (methodName, rest, project, ctx) => {
  return (project.debuggers || []).filter(([classInstance]) => classInstance.prototype[methodName]).map((_, i) => {
    return `${ctx.debuggerVars[i]}.${methodName}${rest}`;
  }).join("\n");
};

export const assembleGameInit = (project, ctx = newContext(project)) => {
  return [
    '() => {',
      debugCall('initBegin', '();', project, ctx),
        ...ctx.init,
      debugCall('initBegin', '();', project, ctx),
    '}',
  ].join("\n");
};

export const assembleGameStep = (project, ctx = newContext(project)) => {
  return [
    '(dt, time) => {',
    debugCall('frameBegin', '();', project, ctx),

      debugCall('updateBegin', '();', project, ctx),
        ...ctx.update,
      debugCall('updateEnd', '();', project, ctx),

      debugCall('renderBegin', '();', project, ctx),
        ...ctx.render,
      debugCall('renderEnd', '();', project, ctx),

    debugCall('frameEnd', '();', project, ctx),
    '}',
  ].join("\n");
};

export const assembleDebuggers = (project, ctx = newContext(project)) => {
  const instantiate = [];
  const attach = [];

  project.debuggers.forEach(([classInstance, path], i) => {
    const debugClass = `${ctx.prefix}Debug${i}`;
    const debugVar = ctx.debuggerVars[i];

    ctx.imports.push([debugClass, path, true]);
    instantiate.push(`const ${debugVar} = new ${debugClass}();`);

    if (classInstance.prototype.attach) {
      if (!attach.length) {
        attach.push(`${ctx.gameClass}.prototype.attachDebug = function(container) {`);
      }
      attach.push(`${debugVar}.attach(container);`);
    }
  });

  if (attach.length) {
    attach.push('return this;');
    attach.push('};');
  }

  return [
    ...instantiate,
    ...attach,
  ].join("\n");
};

export const assembleInstantiateGame = (project, ctx = newContext(project)) => {
  ctx.imports.push([ctx.gameClass, 'game', true]);
  ctx.imports.push([ctx.rendererClass, `renderer/${project.renderer}`, true]);
  ctx.imports.push([ctx.loopClass, `loop`, true]);

  return `
    const ${ctx.rendererVar} = new ${ctx.rendererClass}();
    let [${ctx.renderVars.join(', ')}] = [];

    export default new ${ctx.gameClass}({
      init: ${assembleGameInit(project, ctx)},
      renderer: ${ctx.rendererVar},
      loop: new ${ctx.loopClass}(
        ${assembleGameStep(project, ctx)},
      ),
    });
  `;
}

export const assembleECSSetup = (project, ctx = newContext(project)) => {
  const entityComponentsForComponent = {};
  const indexForEntity = ctx.indexForEntity = {};

  project.entities.forEach((entity, i) => {
    indexForEntity[entity.__id] = 1 + i;

    entity.components.forEach((entityComponent) => {
      const { name } = entityComponent;
      if (!entityComponentsForComponent[entityComponent.name]) {
        entityComponentsForComponent[entityComponent.name] = {};
      }

      entityComponentsForComponent[entityComponent.name][entity.__id] = entityComponent;
    });
  });

  const components = [];
  const componentVarName = {};

  Object.entries(entityComponentsForComponent).forEach(([componentName, entities]) => {
    const component = ComponentByName[componentName];
    const componentFields = [];

    componentVarName[componentName] = `${ctx.prefix}component_${componentName}`;
    ctx.componentFieldVars[componentName] = {};

    component.fields.forEach((field) => {
      const zeroValue = fieldZeroValue(field);
      const values = [zeroValue];

      project.entities.forEach(({__id}, i) => {
        if (!entities[__id]) {
          values.push(zeroValue);
          return;
        }

        let value = entities[__id].fields[field.name];

        if (field.type === 'entity') {
          value = value ? indexForEntity[value] : 0;
        } else {
          value = canonicalizeFieldValue(field, value);
        }

        values.push(value);
      });

      componentFields.push([field.name, values]);

      const fieldVar = project.generateComponentVars ? `${componentVarName[componentName]}.${field.name}` : `${componentVarName[componentName]}_${field.name}`;
      ctx.componentFieldVars[componentName][field.name] = fieldVar;
    });
    components.push([componentName, componentFields]);
  });

  const systemVarName = {};
  const systems = [];

  Systems.forEach((system) => {
    if (system.requiredComponents.find((component) => !entityComponentsForComponent[component.name])) {
      return;
    }

    systemVarName[system.name] = `${ctx.prefix}system_${system.name}`;
    systems.push(system);
  });

  return [
    `const ${ctx.entitiesVar} = [${project.entities.map(({ __id }) => indexForEntity[__id]).join(', ')}];\n`,

    ...components.map(([componentName, fields]) => {
      return [
        (project.generateComponentVars && `const ${componentVarName[componentName]} = new ${ctx.componentClassPrefix}${componentName}Component();\n`),
        ...fields.map(([fieldName, values]) => {
          // @Performance: use ArrayBuffer?
          const field = ctx.componentFieldVars[componentName][fieldName];
          const value = JSON.stringify(values);

          if (project.generateComponentVars) {
            return `${field} = ${value};\n`;
          } else {
            return `const ${field} = ${value};\n`;
          }
        }),
      ].join("");
    }),

    (project.generateComponentVars && `const ${ctx.componentsVar} = [\n${components.map(([componentName]) => `${componentVarName[componentName]},\n`).join("")}];\n`),

    ...systems.map((system) => {
      const systemVar = systemVarName[system.name];
      const entitiesVar = `${systemVar}_entities`;
      let needEntities = false;
      const code = [];

      // @Performance: let system provide inline code

      if (system.prototype.loop_update) {
        needEntities = true;
        ctx.update.push(
          assembleInlineSystemCall(system, 'loop_update', [entitiesVar, 'dt', 'time'], project, ctx),
        );
      }

      const {renderer} = project;
      const renderMethod = `loop_render_${renderer}`;
      if (system.prototype[renderMethod]) {
        if (!ctx.preparedRenderer) {
          ctx.preparedRenderer = true;

          ctx.init.push(
            `[${ctx.renderVars.join(', ')}] = ${ctx.rendererVar}.prepareRenderer();`,
          );

          ctx.render.unshift([
            `${ctx.rendererVar}.beginRender();`,
          ]);
        }

        needEntities = true;
        ctx.render.push(
          assembleInlineSystemCall(system, renderMethod, [...ctx.renderVars, entitiesVar, 'dt', 'time'], project, ctx),
        );
      }

      if (needEntities) {
        const entitiesWithRequiredComponents = project.entities.filter(({ __id }) => {
          return !system.requiredComponents.find((component) => !entityComponentsForComponent[component.name][__id]);
        });

        code.push(`const ${entitiesVar} = [${entitiesWithRequiredComponents.map(({ __id }) => indexForEntity[__id]).join(", ")}];`);
      }

      return [
        (project.generateSystemVars && `const ${systemVar} = new ${ctx.systemClassPrefix}${system.name}System();`),
        ...code,
        ...(project.generateSystemVars && project.generateComponentVars ? system.requiredComponents.map((component) => {
          return `${systemVar}.${component.name} = ${componentVarName[component.name]};\n`
        }) : []),
      ].join("\n");
    }),

    (project.generateSystemVars && `const ${ctx.systemsVar} = [\n${systems.map((system) => `${systemVarName[system.name]},\n`).join("")}];\n`),
  ].join("\n");
}
