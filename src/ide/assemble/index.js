import { assembleGame } from './game';
import defaultIndexHtml from '!!raw-loader!./default-index.html';
import defaultPostbuild from '!!raw-loader!./default-postbuild.sh';
import defaultWebpackConfig from '!!raw-loader!./default-webpack.config.js';
import Handlebars from 'handlebars';

export const assembleIndexHtml = (project) => {
  const content = defaultIndexHtml;
  const template = Handlebars.compile(content);
  return template(project);
};

export const assemblePostbuild = (project) => {
  const content = defaultPostbuild;
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
    debuggers: [],
    generateComponentVars: false,
    generateSystemVars: false,
    generateDebuggerVars: true,
    ...baseProject,
    ...buildSettings,
  };
  project.debug = project.debuggers.length > 0;

  return {
    indexHtml: assembleIndexHtml(project),
    postbuild: assemblePostbuild(project),
    webpackConfig: assembleWebpackConfig(project),
    game: assembleGame(project),
  };
};

export { assembleGame, defaultIndexHtml, defaultPostbuild, defaultWebpackConfig };
