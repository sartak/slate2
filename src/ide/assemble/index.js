import { assembleGame } from './game';
import defaultIndexHtml from '!!raw-loader!./default-index.html';
import defaultWebpackConfig from '!!raw-loader!./default-webpack.config.js';
import Handlebars from 'handlebars';

export const assembleIndexHtml = (project) => {
  const content = defaultIndexHtml;
  const template = Handlebars.compile(content);
  return template(project);
};

export const assembleWebpackConfig = (project) => {
  const content = defaultWebpackConfig;
  const template = Handlebars.compile(content);
  return template(project);
};

export const assembleProject = (baseProject, buildSettings = {}) => {
  const project = {
    ...baseProject,
    ...buildSettings,
  };

  return {
    indexHtml: assembleIndexHtml(project),
    webpackConfig: assembleWebpackConfig(project),
    game: assembleGame(project),
  };
};

export { assembleGame, defaultIndexHtml, defaultWebpackConfig };
