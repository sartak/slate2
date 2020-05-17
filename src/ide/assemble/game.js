import { selectEnabledComponents, selectEnabledSystems } from '../project/selectors';
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
    entityMap: {},
    entityObjects: [],
    componentsVar: `${prefix}allComponents`,
    componentMap: {},
    componentObjects: [],
    systemsVar: `${prefix}allSystems`,
    systemMap: {},
    systemObjects: [],
    gameClass: `${prefix}Game`,
    rendererClass: `${prefix}Renderer`,
    rendererVar: `${prefix}renderer`,
    loopClass: `${prefix}Loop`,
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

export const prepareEntitySetup = (project, ctx = newContext(project)) => {
  const { entityMap, entityObjects } = ctx;
  const { entities } = project;

  entities.forEach((entity, i) => {
    entityObjects.push(entity);
    entityMap[entity.id] = {
      entity,
      index: 1 + i,
    };
  });
};

export const prepareComponentSetup = (project, ctx = newContext(project)) => {
  const { componentMap, componentObjects, entityMap, entityObjects } = ctx;
  const { generateComponentVars } = project;

  selectEnabledComponents(project).forEach((component) => {
    const componentId = component.id;

    const entities = entityObjects.filter((entity) => entity.componentConfig[componentId]);
    if (!entities.length) {
      return;
    }

    const entityComponents = {};
    const fields = [];
    const fieldVarNames = {};
    const fieldVarNamesByLabel = {};
    const componentVarName = `${ctx.prefix}component_${component.label}`;

    entities.forEach((entity) => {
      entityComponents[entity.id] = entity.componentConfig[componentId];
    });

    component.fields.forEach((field) => {
      const fieldId = field.id;
      const zeroValue = fieldZeroValue(field);
      const values = [zeroValue];

      entityObjects.forEach((entity) => {
        const entityId = entity.id;

        if (!entityComponents[entityId]) {
          values.push(zeroValue);
          return;
        }

        let value = entity.componentConfig[componentId].values[fieldId];

        if (field.type === 'entity') {
          value = value ? entityMap[value].index : 0;
        } else {
          value = canonicalizeFieldValue(field, value);
        }

        values.push(value);
      });

      fields.push([field, values]);

      const fieldLabel = field.label ?? fieldId;

      const fieldVarName = generateComponentVars ? `${componentVarName}.${fieldId}` : `${componentVarName}_${fieldLabel}`;
      fieldVarNames[fieldId] = fieldVarName;
      fieldVarNamesByLabel[fieldLabel] = fieldVarName;
    });

    componentObjects.push(component);
    componentMap[componentId] = {
      component,
      entityObjects: entities,
      entityComponents,
      varName: componentVarName,
      fields,
      fieldVarNames,
      fieldVarNamesByLabel,
    };
  });
};

export const prepareSystemSetup = (project, ctx = newContext(project)) => {
  const { componentMap, systemMap, systemObjects, entityObjects } = ctx;
  const { renderer } = project;

  selectEnabledSystems(project).forEach((system) => {
    const systemId = system.id;
    const { requiredComponents } = system;

    const componentMaps = [];
    for (let i = 0, len = requiredComponents.length; i < len; ++i) {
      const componentId = requiredComponents[i];
      const map = componentMap[componentId];
      if (!map) {
        return;
      } else {
        componentMaps.push(map);
      }
    }

    const varName = `${ctx.prefix}system_${system.label}`;
    const entitiesVar = `${varName}_entities`;
    const renderMethod = `render_${renderer}`;
    let systemEntities = [];
    let needsEntities = false;
    let needsRenderer = false;
    let updateCodeGenerator = null;
    let renderCodeGenerator = null;

    if (system.__proto__.update) {
      needsEntities = true;
      updateCodeGenerator = () => assembleInlineSystemCall(system, 'update', [entitiesVar, 'dt', 'time'], project, ctx);
    }

    if (system.__proto__[renderMethod]) {
      needsEntities = true;
      needsRenderer = true;
      renderCodeGenerator = () => assembleInlineSystemCall(system, renderMethod, [...ctx.renderVars, entitiesVar, 'dt', 'time'], project, ctx);
    }

    if (needsEntities) {
      systemEntities = entityObjects.filter(({ id }) => {
        return !componentMaps.find(({ entityComponents }) => !entityComponents[id]);
      });
    }

    systemObjects.push(system);
    systemMap[systemId] = {
      system,
      varName,
      updateCodeGenerator,
      renderCodeGenerator,
      renderMethod,
      needsRenderer,
      needsEntities,
      entitiesVar,
      entityObjects: systemEntities,
      componentObjects: componentMaps.map(({ component }) => component),
    };
  });
};

export const assembleEntitySetup = (project, ctx = newContext(project)) => {
  const { entitiesVar, entityMap, entityObjects } = ctx;
  const indexes = entityObjects.map(({ id }) => entityMap[id].index);
  return `const ${entitiesVar} = [${indexes.join(', ')}];\n`;
};

export const assembleComponentSetup = (project, ctx = newContext(project)) => {
  const { componentMap, componentObjects } = ctx;
  const { generateComponentVars } = project;

  return [
    ...componentObjects.map((component) => {
      const { fields, varName: componentVarName, fieldVarNames } = componentMap[component.id];
      return [
        (generateComponentVars && `const ${componentVarName} = {};`),

        ...fields.map(([field, values]) => {
          const varName = fieldVarNames[field.id];

          // @Performance: use ArrayBuffer?
          const value = JSON.stringify(values);

          if (generateComponentVars) {
            return `${varName} = ${value};`;
          } else {
            return `const ${varName} = ${value};`;
          }
        }),
      ].join("\n");
    }),

    ...(generateComponentVars ? [
      `const ${ctx.componentsVar} = {`,
        ...componentObjects.map((component) => `"${component.id}": ${componentMap[component.id].varName},`),
      `}`,
    ] : []),
  ].join("\n");
};

export const assembleSystemSetup = (project, ctx = newContext(project)) => {
  const { entityMap, componentMap, systemMap, systemObjects, systemClassPrefix } = ctx;
  const { generateComponentVars, generateSystemVars } = project;

  return [
    ...systemObjects.map((system) => {
      const systemId = system.id;
      const { varName, updateCodeGenerator, needsRenderer, renderCodeGenerator, needsEntities, entitiesVar, entityObjects, componentObjects } = systemMap[systemId];

      if (needsRenderer && !ctx.preparedRenderer) {
        ctx.preparedRenderer = true;

        ctx.init.push(
          `[${ctx.renderVars.join(', ')}] = ${ctx.rendererVar}.prepareRenderer();`,
        );

        ctx.render.unshift([
          `${ctx.rendererVar}.beginRender();`,
        ]);
      }

      if (updateCodeGenerator) {
        ctx.update.push(updateCodeGenerator());
      }

      if (renderCodeGenerator) {
        ctx.render.push(renderCodeGenerator());
      }

      return [
        (generateSystemVars && `const ${varName} = new ${systemClassPrefix}${system.id}();`),
        (needsEntities && `const ${entitiesVar} = [${entityObjects.map(({id}) => entityMap[id].index)}];`),
        ...(generateSystemVars && generateComponentVars ?
          componentObjects.map((component) => {
            return `${varName}.${component.label} = ${componentMap[component.id].varName};`;
          })
        : []),
      ].join("\n");
    }),

    ...(generateSystemVars ? [
      `const ${ctx.systemsVar} = {`,
        ...systemObjects.map((system) => `"${system.id}": ${systemMap[system.id].varName},`),
      `}`,
    ] : []),
  ].join("\n");
};

export const assembleECSSetup = (project, ctx = newContext(project)) => {
  prepareEntitySetup(project, ctx);
  prepareComponentSetup(project, ctx);
  prepareSystemSetup(project, ctx);

  return [
    assembleEntitySetup(project, ctx),
    assembleComponentSetup(project, ctx),
    assembleSystemSetup(project, ctx),
  ].join("\n");
}
