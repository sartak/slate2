export default (project) => {
  return `
    import Game from '@slate2/game';
    import Renderer from '@slate2/renderer/${project.renderer}';

    export default new Game({
      renderer: Renderer,
      run: ${JSON.stringify(project.code)},
    });
  `;
};
