import { ComponentByName, Systems } from '../project/ecs';
import { canonicalizeFieldValue, fieldZeroValue } from '../project/types';

export const newContext = (project, overrides = {}) => {
  const prefix = 'prefix' in overrides ? overrides.prefix : '__';

  const renderVarsForRenderer = {
    'canvas': `${prefix}ctx`,
    'webgl': `${prefix}ctx`,
    'webgpu': `${prefix}ctx`,
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

    export default new ${ctx.gameClass}({
      init: ${assembleGameInit(project, ctx)},

      entities: ${ctx.entitiesVar},
      components: ${ctx.componentsVar},
      systems: ${ctx.systemsVar},

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

    ctx.imports.push([`${componentName}Component as ${ctx.componentClassPrefix}${componentName}Component`, `../ide/components/${componentName}`]);

    componentVarName[componentName] = `${ctx.prefix}component_${componentName}`;

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
    ctx.imports.push([`${system.name}System as ${ctx.systemClassPrefix}${system.name}System`, `../ide/systems/${system.name}`]);
  });

  return [
    `const ${ctx.entitiesVar} = [${project.entities.map(({ __id }) => indexForEntity[__id]).join(', ')}];\n`,

    ...components.map(([componentName, fields]) => {
      return [
        `const ${componentVarName[componentName]} = new ${ctx.componentClassPrefix}${componentName}Component();\n`,
        ...fields.map(([fieldName, values]) => {
          // @Performance: use ArrayBuffer?
          return `${componentVarName[componentName]}.${fieldName} = ${JSON.stringify(values)};\n`;
        }),
      ].join("");
    }),

    `const ${ctx.componentsVar} = [\n${components.map(([componentName]) => `${componentVarName[componentName]},\n`).join("")}];\n`,

    ...systems.map((system) => {
      const systemVar = systemVarName[system.name];
      const entitiesVar = `${systemVar}_entities`;
      let needEntities = false;
      const code = [];

      // @Performance: let system provide inline code

      if (system.prototype.loop_update) {
        const loopVar = `${systemVar}_loop_update`;
        code.push(`let ${loopVar} = null;`);

        ctx.init.push(
          `${loopVar} = ${systemVar}.loop_update();`,
        );

        needEntities = true;
        ctx.update.push(
          `${loopVar}(${entitiesVar}, dt);`,
        );
      }

      const {renderer} = project;
      const renderMethod = `loop_render_${renderer}`;
      if (system.prototype[renderMethod]) {
        const loopVar = `${systemVar}_loop_render_${renderer}`;
        code.push(`let ${loopVar} = null;`);

        if (!ctx.preparedRenderer) {
          ctx.preparedRenderer = true;

          ctx.init.push(
            `const [${ctx.renderVars}] = ${ctx.rendererVar}.prepareRenderer();`,
          );

          ctx.render.unshift([
            `${ctx.rendererVar}.beginRender();`,
          ]);
        }

        ctx.init.push(
          `${loopVar} = ${systemVar}.${renderMethod}(${ctx.renderVars});`,
        );

        needEntities = true;
        ctx.render.push(
          `${loopVar}(${entitiesVar}, dt);`,
        );
      }

      if (needEntities) {
        const entitiesWithRequiredComponents = project.entities.filter(({ __id }) => {
          return !system.requiredComponents.find((component) => !entityComponentsForComponent[component.name][__id]);
        });

        code.push(`let ${entitiesVar} = [${entitiesWithRequiredComponents.map(({ __id }) => indexForEntity[__id]).join(", ")}];`);
      }

      return `
        const ${systemVar} = new ${ctx.systemClassPrefix}${system.name}System();
        ${code.join("\n")}
        ${system.requiredComponents.map((component) => {
          return `${systemVar}.${component.name} = ${componentVarName[component.name]};\n`
        }).join("")}
      `;
    }),

    `const ${ctx.systemsVar} = [\n${systems.map((system) => `${systemVarName[system.name]},\n`).join("")}];\n`,
  ].join("\n");
}
