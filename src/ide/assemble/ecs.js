import { assembleInlineSystemCall } from './inline';
import { canonicalizeValue, zeroValueForType } from '../types';
import { selectEntityList, selectEnabledComponents, selectEnabledSystems } from '../project/selectors';

export const prepareEntities = (project, ctx) => {
  const { entityMap, entityObjects } = ctx;

  selectEntityList(project).forEach((entity, i) => {
    entityObjects.push(entity);
    entityMap[entity.id] = {
      entity,
      index: 1 + i,
    };
  });
};

export const prepareComponents = (project, ctx) => {
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
      const { id: fieldId, type, defaultValue } = field;

      const zeroValue = zeroValueForType(type);
      const values = [zeroValue];

      entityObjects.forEach((entity) => {
        const entityId = entity.id;

        if (!entityComponents[entityId]) {
          values.push(zeroValue);
          return;
        }

        let value = entity.componentConfig[componentId].values[fieldId];

        if (type === 'entity') {
          value = value ? entityMap[value].index : 0;
        } else {
          value = canonicalizeValue(type, value, defaultValue);
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

export const prepareSystems = (project, ctx) => {
  const { componentMap, systemMap, systemObjects, entityObjects, renderer } = ctx;

  selectEnabledSystems(project).forEach((system) => {
    const systemId = system.id;
    const { requiredComponents, initSkipDesignMode } = system;

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
    const initReturnVar = `${varName}_init_return`;
    let systemEntities = [];
    let needsEntities = false;
    let needsRenderer = false;
    let hasInit = false;
    let initCodeGenerator = null;
    let inputCodeGenerator = null;
    let updateCodeGenerator = null;
    let renderCodeGenerator = null;
    let deinitCodeGenerator = null;

    const baseParams = [];

    if (system.__proto__.init) {
      hasInit = true;
      initCodeGenerator = (ctx) => {
        if (initSkipDesignMode && ctx.designMode) {
          return null;
        }

        const implementation = assembleInlineSystemCall(system, 'init', [], project, ctx);
        return `${initReturnVar} = ${implementation};`
      };

      baseParams.push(initReturnVar);
    }

    if (system.__proto__.input) {
      inputCodeGenerator = () => assembleInlineSystemCall(system, 'input', [...baseParams], project, ctx);
    }

    if (system.__proto__.update) {
      needsEntities = true;
      updateCodeGenerator = () => assembleInlineSystemCall(system, 'update', [...baseParams, entitiesVar, 'dt', 'time'], project, ctx);
    }

    if (system.__proto__[renderMethod]) {
      needsEntities = true;
      needsRenderer = true;
      renderCodeGenerator = () => assembleInlineSystemCall(system, renderMethod, [...baseParams, ...ctx.renderVars, entitiesVar, 'dt', 'time'], project, ctx);
    }

    if (system.__proto__.deinit) {
      deinitCodeGenerator = (ctx) => {
        if (initSkipDesignMode && ctx.designMode) {
          return null;
        }

        return assembleInlineSystemCall(system, 'deinit', [...baseParams], project, ctx);
      };
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
      initCodeGenerator,
      inputCodeGenerator,
      updateCodeGenerator,
      renderCodeGenerator,
      deinitCodeGenerator,
      renderMethod,
      needsRenderer,
      initReturnVar,
      hasInit,
      needsEntities,
      entitiesVar,
      entityObjects: systemEntities,
      componentObjects: componentMaps.map(({ component }) => component),
    };
  });
};

export const assembleEntities = (project, ctx) => {
  const { entitiesVar, entityMap, entityObjects } = ctx;
  const indexes = entityObjects.map(({ id }) => entityMap[id].index);
  return [
    ...entityObjects.map(({ label, id }) => `// ${entityMap[id].index}: ${label}`),
    `const ${entitiesVar} = [${indexes.join(', ')}];`,
  ];
};

export const assembleComponents = (project, ctx) => {
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
      ];
    }),

    ...(generateComponentVars ? [
      `const ${ctx.componentsVar} = {`,
        ...componentObjects.map((component) => `"${component.id}": ${componentMap[component.id].varName},`),
      `};`,
    ] : []),
  ];
};

export const assembleSystems = (project, ctx) => {
  const { entityMap, componentMap, systemMap, systemObjects, systemClassPrefix } = ctx;
  const { generateComponentVars, generateSystemVars } = project;

  return [
    ...systemObjects.map((system) => {
      const systemId = system.id;
      const { varName, initCodeGenerator, inputCodeGenerator, updateCodeGenerator, needsRenderer, renderCodeGenerator, deinitCodeGenerator, hasInit, initReturnVar, needsEntities, entitiesVar, entityObjects, componentObjects } = systemMap[systemId];

      if (needsRenderer && !ctx.preparedRenderer) {
        ctx.preparedRenderer = true;

        ctx.init.push((ctx) => (
          `[${ctx.renderVars.join(', ')}] = ${ctx.rendererVar}.prepareRenderer();`
        ));

        ctx.render.unshift((ctx) => (
          `${ctx.rendererVar}.beginRender();`
        ));
      }

      if (initCodeGenerator) {
        ctx.init.push(initCodeGenerator);
      }

      if (inputCodeGenerator) {
        ctx.input.push(inputCodeGenerator);
      }

      if (updateCodeGenerator) {
        ctx.update.push(updateCodeGenerator);
      }

      if (renderCodeGenerator) {
        ctx.render.push(renderCodeGenerator);
      }

      if (deinitCodeGenerator) {
        ctx.deinit.push(deinitCodeGenerator);
      }

      return [
        (generateSystemVars && `const ${varName} = new ${systemClassPrefix}${system.id}();`),

        (needsEntities && `const ${entitiesVar} = [${entityObjects.map(({id}) => entityMap[id].index)}];`),
        ...(generateSystemVars && generateComponentVars ?
          componentObjects.map((component) => {
            return `${varName}.${component.label} = ${componentMap[component.id].varName};`;
          })
        : []),

        (hasInit && `let ${initReturnVar} = undefined;`),
      ];
    }),

    ...(generateSystemVars ? [
      `const ${ctx.systemsVar} = {`,
        ...systemObjects.map((system) => `"${system.id}": ${systemMap[system.id].varName},`),
      `};`,
    ] : []),
  ];
};

export const prepareECS = (project, ctx) => {
  prepareEntities(project, ctx);
  prepareComponents(project, ctx);
  prepareSystems(project, ctx);
}

export const assembleECS = (project, ctx) => {
  return [
    ...assembleEntities(project, ctx),
    ...assembleComponents(project, ctx),
    ...assembleSystems(project, ctx),
  ];
}
