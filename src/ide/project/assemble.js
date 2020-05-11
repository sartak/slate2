export default (project) => {
  return `
    import Game from '@slate2/game';
    export default new Game({
      run: ${JSON.stringify(project.code)},
    });
  `;
};
