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
