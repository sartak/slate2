import { ComponentByName } from '../project/components';

export const assembleProject = (project) => {
  return `
    ${assembleImports(project)}
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
      ${assembleECS(project)},
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

export const assembleECS = (project) => {
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
  Object.entries(entityComponentsForComponent).forEach(([componentName, { entities }]) => {
    const component = ComponentByName[componentName];
    const componentFields = [];

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
        values.push(value);
      });

      componentFields.push([fieldName, values]);
    });
    components.push([componentName, componentFields]);
  });

  return `
    entities: [${project.entities.map(({ __id }) => indexForEntity[__id]).join(', ')}],
    components: [${components.map(([componentName, fields]) => {
      return `new ${componentName}Component({
        ${fields.map(([fieldName, values]) => {
          // @Performance: use ArrayBuffer?
          return `  ${fieldName}: ${JSON.stringify(values)},\n`;
        }).join("")}
      })\n`;
    }).join(', ')}],
    systems: {}
  `;
}
