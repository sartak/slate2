export const assembleProject = (project) => {
  return `
    import Game from '@slate2/game';
    import Renderer from '@slate2/renderer/${project.renderer}';

    ${assembleGame(project)}
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
