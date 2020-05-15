import { ComponentByName } from '../project/components';

export const assembleProject = (project) => {
  return `
    ${assembleImports(project)}
    ${assembleECSSetup(project)}
    ${assembleGame(project)}
  `;
};

export const assembleImports = (project) => {
  return `
    import Game from '@slate2/game';
    import Renderer from '@slate2/renderer/${project.renderer}';
    ${assembleECSImports(project)}
  `;
};

export const assembleGame = (project) => {
  return `
    export default new Game({
      renderer: Renderer,
      init: () => { },
      update: (dt, time) => { },
      entities,
      components,
      systems,
    });
  `;
}

export const assembleECSImports = (project) => {
  const componentNames = {};

  project.entities.forEach(({ components }) => {
    components.forEach(({ name }) => {
      componentNames[name] = true;
    });
  });

  return `${Object.keys(componentNames).map((name) => `
    import { ${name}Component } from '@slate2/components/${name}';
  `).join("")}`;
};

export const assembleECSSetup = (project) => {
  const entityComponentsForComponent = {};
  const indexForEntity = {};

  project.entities.forEach((entity, i) => {
    indexForEntity[entity.__id] = 1 + i;

    entity.components.forEach((entityComponent) => {
      const { name } = entityComponent;
      if (!entityComponentsForComponent[entityComponent.name]) {
        entityComponentsForComponent[entityComponent.name] = {
          entities: {},
        };
      }

      entityComponentsForComponent[entityComponent.name].entities[entity.__id] = entityComponent;
    });
  });

  const components = [];
  const componentVarName = {};

  Object.entries(entityComponentsForComponent).forEach(([componentName, { entities }]) => {
    const component = ComponentByName[componentName];
    const componentFields = [];

    componentVarName[componentName] = `component_${componentName}`;

    component.fields.forEach(({name: fieldName, type, default: defaultValue}) => {
      let zeroValue;

      switch (type) {
        case 'entity':
        case 'float':
          zeroValue = 0;
          break;
        case 'color':
          zeroValue = '#000000';
          break;
        default:
          throw new Error(`Unhandled type ${type} for zero value`);
      }

      const values = [zeroValue];

      project.entities.forEach(({__id}, i) => {
        if (!entities[__id]) {
          values.push(zeroValue);
          return;
        }

        let value = entities[__id].fields[fieldName];

        if (type === 'entity') {
          value = value ? indexForEntity[value] : 0;
        } else if (value === undefined || value === null) {
          value = defaultValue;
        } else {
          switch (type) {
            case 'float': {
              value = Number(value);
              break;
            }
            case 'color': {
              value = value.toLowerCase();
              break;
            }
            default: {
              throw new Error(`Unhandled type ${type} for entity-component values`);
            }
          }
        }
        values.push(value);
      });

      componentFields.push([fieldName, values]);
    });
    components.push([componentName, componentFields]);
  });

  return [
    `const entities = [${project.entities.map(({ __id }) => indexForEntity[__id]).join(', ')}];`,

    ...components.map(([componentName, fields]) => {
      return `const ${componentVarName[componentName]} = new ${componentName}Component({
        ${fields.map(([fieldName, values]) => {
          // @Performance: use ArrayBuffer?
          return `  ${fieldName}: ${JSON.stringify(values)},\n`;
        }).join("")}
      });\n`;
    }),

    `const components = [\n${components.map(([componentName]) => `${componentVarName[componentName]},\n`).join("")}];\n`,

    `const systems = [];\n`,
  ].join("\n");
}
