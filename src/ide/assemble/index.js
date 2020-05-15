import { assembleGame } from './game';
import defaultIndexHtml from '!!raw-loader!./default-index.html';
import defaultWebpackConfig from '!!raw-loader!./default-webpack.config.js';

export const assembleProject = (project) => {
  return {
    indexHtml: defaultIndexHtml,
    webpackConfig: defaultWebpackConfig,
    game: assembleGame(project),
  };
};

export { assembleGame, defaultIndexHtml, defaultWebpackConfig };
