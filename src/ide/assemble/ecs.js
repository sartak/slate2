import { assembleInlineSystemCall, assembleRemoveIndexFromList, assembleRemoveEntryFromList, assembleRemoveEntryFromListIfPresent  } from './inline';
import { canonicalizeValue, zeroValueForType } from '../types';
import { selectEntityList, selectEnabledComponents, selectEnabledSystems } from '../project/selectors';

export const prepareEntities = (project, ctx) => {
  const { entityMap, entityReverseMap, entityObjects } = ctx;

  selectEntityList(project).forEach((entity, i) => {
    entityObjects.push(entity);
    const index = 1 + i;
    const preflightId = `entity_${entity.id}`;
    entityMap[entity.id] = {
      entity,
      id: preflightId,
      index,
    };
    entityReverseMap[preflightId] = entity.id;
  });
};

export const prepareComponents = (project, ctx) => {
  const { componentMap, componentObjects, entityMap, entityObjects: allEntities } = ctx;
  const { generateComponentVars } = project;

  selectEnabledComponents(project).forEach((component) => {
    const componentId = component.id;

    const entityHasComponent = [false];
    const entities = [];
    const entityComponents = {};

    allEntities.forEach((entity) => {
      if (entity.componentConfig[componentId]) {
        entityHasComponent.push(true);
        entities.push(entity);
        entityComponents[entity.id] = entity.componentConfig[componentId];
      } else {
        entityHasComponent.push(false);
      }
    });

    if (!entities.length) {
      return;
    }

    const fields = [];
    const fieldVarNames = {};
    const fieldVarNamesByLabel = {};
    const componentVarName = `${ctx.prefix}component_${component.label}`;
    const entityHasComponentVar = generateComponentVars ? `${componentVarName}.hasEntity` : `${componentVarName}_hasEntity`;;

    component.fields.forEach((field) => {
      const { id: fieldId, type, defaultValue } = field;

      const zeroValue = zeroValueForType(type);
      const values = [zeroValue];

      allEntities.forEach((entity) => {
        const entityId = entity.id;

        if (!entityComponents[entityId]) {
          values.push(zeroValue);
          return;
        }

        let value = entity.componentConfig[componentId].values[fieldId];

        if (type === 'entity') {
          value = value ? entityMap[value].id : 0;
        } else {
          value = canonicalizeValue(type, value, defaultValue);
        }

        values.push(value);
      });

      fields.push([field, values]);

      const fieldLabel = field.label ?? fieldId;
      let fieldVarName;

      if (generateComponentVars) {
        if (Number.isInteger(fieldId)) {
          fieldVarName = `${componentVarName}[${fieldId}]`;
        }
        else {
          fieldVarName = `${componentVarName}.${fieldId}`;
        }
      } else {
        fieldVarName = `${componentVarName}_${fieldId}`;
      }

      fieldVarNames[fieldId] = fieldVarName;
      fieldVarNamesByLabel[fieldLabel] = fieldVarName;
    });

    componentObjects.push(component);
    componentMap[componentId] = {
      component,
      entityObjects: entities,
      entityComponents,
      entityHasComponent,
      entityHasComponentVar,
      varName: componentVarName,
      fields,
      fieldVarNames,
      fieldVarNamesByLabel,
      attachedSystems: [],
    };
  });
};

export const prepareSystems = (project, ctx) => {
  const { componentMap, systemMap, systemObjects, entityObjects, renderer, commandFrameVar, commandKeysVar, attachListenerFn } = ctx;

  selectEnabledSystems(project).forEach((system) => {
    const systemId = system.id;
    const { requiredComponents, userDefined } = system;

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

    componentMaps.forEach(({ attachedSystems }) => {
      attachedSystems.push(system);
    });

    const varName = `${ctx.prefix}system_${system.label}`;
    const entitiesVar = `${varName}_entities`;
    const renderMethodName = `render_${renderer}`;
    const initReturnVar = `${varName}_init_return`;
    let systemEntities = [];
    let needsEntities = false;
    let needsRenderer = false;
    let hasInit = false;
    const codeGenerators = {};

    const baseParams = [];

    const getMethod = (name) => {
      if (userDefined && system.methods[name]) {
        return { func: system.methods[name] };
      }
      if (system.__proto__[name]) {
        return { file: system.constructor.sourceCode };
      }
      return undefined;
    };

    const initMethod = getMethod('init');
    if (initMethod) {
      hasInit = true;
      codeGenerators.init = (ctx) => {
        const implementation = assembleInlineSystemCall(system, 'init', initMethod, [commandKeysVar, attachListenerFn], project, ctx);
        return `${initReturnVar} = ${implementation};`
      };

      baseParams.push(initReturnVar);
    }

    const inputMethod = getMethod('input');
    if (inputMethod) {
      codeGenerators.input = () => assembleInlineSystemCall(system, 'input', inputMethod, [...baseParams, commandFrameVar], project, ctx);
    }

    const updateMethod = getMethod('update');
    if (updateMethod) {
      needsEntities = true;
      codeGenerators.update = () => assembleInlineSystemCall(system, 'update', updateMethod, [...baseParams, entitiesVar, ctx.dtUpdateAmount, ctx.timeUpdateVar], project, ctx);
    }

    const renderMethod = getMethod(renderMethodName);
    if (renderMethod) {
      needsEntities = true;
      needsRenderer = true;
      codeGenerators[renderMethodName] = () => assembleInlineSystemCall(system, renderMethodName, renderMethod, [...baseParams, ...ctx.renderVars, entitiesVar, ctx.dtStepVar, ctx.timeStepVar], project, ctx);
    }

    const deinitMethod = getMethod('deinit');
    if (deinitMethod) {
      codeGenerators.deinit = (ctx) => {
        return assembleInlineSystemCall(system, 'deinit', deinitMethod, [...baseParams], project, ctx);
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
      codeGenerators,
      renderMethodName,
      needsRenderer,
      initReturnVar,
      hasInit,
      needsEntities,
      entitiesVar: needsEntities ? entitiesVar : null,
      entityObjects: systemEntities,
      componentObjects: componentMaps.map(({ component }) => component),
    };
  });
};

export const prepareManager = (project, ctx) => {
  const { prefix, componentMap } = ctx;
  Object.values(componentMap).forEach((map) => {
    map.addToEntityFn = `${prefix}add${map.component.id}ToEntity`;
    map.removeFromEntityFn = `${prefix}remove${map.component.id}FromEntity`;
  });
};

export const assembleEntities = (project, ctx) => {
  const { entitiesVar, entityIndexLookupVar, entityMap, entityObjects } = ctx;
  return [
    `const ${entitiesVar} = [`,
      '0,',
      ...entityObjects.map((entity) => (
        `${JSON.stringify(entityMap[entity.id].id)}, // ${entity.label}`
      )),
    `];`,
    `const ${entityIndexLookupVar} = {`,
      ...entityObjects.map((entity) => {
        const { id, index } = entityMap[entity.id];
        return (
          `${JSON.stringify(id)}: ${index},`
        );
      }),
    `};`,
  ];
};

export const assembleComponents = (project, ctx) => {
  const { componentMap, componentObjects } = ctx;
  const { generateComponentVars } = project;

  return [
    ...componentObjects.map((component) => {
      const { fields, varName: componentVarName, fieldVarNames, entityHasComponent, entityHasComponentVar } = componentMap[component.id];
      return [
        (generateComponentVars && `const ${componentVarName} = {};`),

        `${generateComponentVars ? "" : "const "}${entityHasComponentVar} = [${entityHasComponent.map((has) => has ? "true" : "false").join(', ')}];`,

        ...fields.map(([field, values]) => {
          const varName = fieldVarNames[field.id];

          // @Performance: use ArrayBuffer?
          const value = JSON.stringify(values);

          return `${generateComponentVars ? "" : "const "}${varName} = ${value}; /* ${ field.label ?? field.id } */`;
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
  const { generateSystemVars } = project;

  return [
    ...systemObjects.map((system) => {
      const systemId = system.id;
      const { varName, codeGenerators, renderMethodName, needsRenderer, hasInit, initReturnVar, needsEntities, entitiesVar, entityObjects, componentObjects } = systemMap[systemId];

      if (needsRenderer && !ctx.preparedRenderer) {
        ctx.preparedRenderer = true;

        ctx.init.push((ctx) => (
          `[${ctx.renderVars.join(', ')}] = ${ctx.rendererVar}.prepareRenderer();`
        ));

        ctx.render.unshift((ctx) => (
          `${ctx.rendererVar}.beginRender();`
        ));
      }

      if (codeGenerators.init) {
        ctx.init.push(codeGenerators.init);
      }

      if (codeGenerators.input) {
        ctx.input.push(codeGenerators.input);
      }

      if (codeGenerators.update) {
        ctx.update.push(codeGenerators.update);
      }

      if (codeGenerators[renderMethodName]) {
        ctx.render.push(codeGenerators[renderMethodName]);
      }

      if (codeGenerators.deinit) {
        ctx.deinit.push(codeGenerators.deinit);
      }

      return [
        (generateSystemVars && `const ${varName} = new ${systemClassPrefix}${system.id}();`),

        (needsEntities && `const ${entitiesVar} = [${entityObjects.map(({id}) => JSON.stringify(entityMap[id].id)).join(', ')}];`),

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

export const assembleManager = (project, ctx) => {
  const { prefix, componentMap, systemMap, entitiesVar, entityIndexLookupVar, cloneEntityFn, destroyEntityFn } = ctx;

  const allComponentMaps = Object.values(componentMap);
  const allSystemMaps = Object.values(systemMap);

  return [
    `const ${cloneEntityFn} = (sourceId) => {`,
      `const sourceIndex = ${entityIndexLookupVar}[sourceId];`,
      `const cloneId = 'entity_' + Math.random();`,
      `const cloneIndex = ${entitiesVar}.length;`,

      `${entitiesVar}.push(cloneId);`,
      `${entityIndexLookupVar}[cloneId] = cloneIndex;`,

      ...allComponentMaps.map(({ component, entityHasComponentVar, fieldVarNames }) => {
        return [
          `${entityHasComponentVar}[cloneIndex] = ${entityHasComponentVar}[sourceIndex];`,
          ...component.fields.map((field) => {
            return [
              `${fieldVarNames[field.id]}[cloneIndex] = ${fieldVarNames[field.id]}[sourceIndex];`,
            ];
          }),
        ];
      }),

      ...allSystemMaps.map(({ entitiesVar }) => {
        if (!entitiesVar) {
          return;
        }

        return [
          `if (${entitiesVar}.indexOf(sourceId) !== -1) {`,
          `${entitiesVar}.push(cloneId);`,
          `}`,
        ];
      }),

      `return cloneId;`,
    `};`,

    `const ${destroyEntityFn} = (entityId) => {`,
      `const entityIndex = ${entityIndexLookupVar}[entityId];`,

      `if (entityIndex < ${entitiesVar}.length - 1) {`,
        `${entitiesVar}[entityIndex] = ${entitiesVar}[${entitiesVar}.length - 1];`,
        `${entityIndexLookupVar}[${entitiesVar}[entityIndex]] = entityIndex;`,
      `}`,

      `${entitiesVar}.length--;`,
      `delete ${entityIndexLookupVar}[entityId];`,

      ...allComponentMaps.map(({ component, entityHasComponentVar, fieldVarNames }) => {
        return [
          ...assembleRemoveIndexFromList(entityHasComponentVar, 'entityIndex'),
          ...component.fields.map((field) => {
            return assembleRemoveIndexFromList(fieldVarNames[field.id], 'entityIndex');
          }),
        ];
      }),

      ...allSystemMaps.map(({ entitiesVar }) => {
        if (!entitiesVar) {
          return;
        }

        const tmpVar = `${entitiesVar}_tmp`;
        return assembleRemoveEntryFromListIfPresent(entitiesVar, 'entityId', tmpVar);
      }),
    `};`,

    ...allComponentMaps.map((map) => {
      const { component, addToEntityFn, removeFromEntityFn, fieldVarNames, attachedSystems, entityHasComponentVar } = map;
      const fieldParams = component.fields.map(({ id }) => `${ctx.prefix}${id}`);
      return [
        `const ${addToEntityFn} = (entityId, ${fieldParams.join(", ")}) => {`,
          `const entityIndex = ${entityIndexLookupVar}[entityId];`,
          `if (!${entityHasComponentVar}[entityIndex]) {`,
            `${entityHasComponentVar}[entityIndex] = true;`,

            ...component.fields.map((field, i) => {
              return [
                `${fieldVarNames[field.id]}[entityIndex] = ${fieldParams[i]};`,
              ];
            }),

            // @Incomplete: when an entity can be part of a system through
            // multiple paths (e.g. render rect or render sprite), we'll need
            // to be more careful.
            ...attachedSystems.map((system) => {
              const { entitiesVar, componentObjects } = systemMap[system.id];
              const checkComponents = componentObjects.filter((c) => c !== component);
              return [
                (checkComponents.length ? [
                  `if (`,
                  checkComponents.map((component) => {
                    const { entityHasComponentVar } = componentMap[component.id];
                    return [
                      `${entityHasComponentVar}[entityIndex]`,
                    ];
                  }).join(' && '),
                  `) {`,
                ].join("") : null),

                `${entitiesVar}.push(entityId);`,

                ...(checkComponents.length ? [
                  `}`,
                ] : []),
              ];
            }),
          `}`,
        `};`,

        `const ${removeFromEntityFn} = (entityId) => {`,
          `const entityIndex = ${entityIndexLookupVar}[entityId];`,
          `if (${entityHasComponentVar}[entityIndex]) {`,
            `${entityHasComponentVar}[entityIndex] = false;`,

            // @Incomplete: when an entity can be part of a system through
            // multiple paths (e.g. render rect or render sprite), we'll need
            // to be more careful.
            ...attachedSystems.map((system) => {
              const { entitiesVar } = systemMap[system.id];
              return assembleRemoveEntryFromList(entitiesVar, 'entityId');
            }),
          `}`,
        `};`,
      ];
    }),
  ];
};

export const prepareECS = (project, ctx) => {
  prepareEntities(project, ctx);
  prepareComponents(project, ctx);
  prepareSystems(project, ctx);
  prepareManager(project, ctx);
}

export const assembleECS = (project, ctx) => {
  return [
    ...assembleEntities(project, ctx),
    ...assembleComponents(project, ctx),
    ...assembleSystems(project, ctx),
    ...assembleManager(project, ctx),
  ];
}
