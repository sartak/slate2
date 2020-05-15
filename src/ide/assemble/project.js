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
  `;
};

export const assembleGame = (project) => {
  return `
    export default new Game({
      renderer: Renderer,
      init: () => { },
      update: (dt, time) => { },
    });
  `;
}
