import { assembleGame } from './game';
import defaultIndexHtml from '!!raw-loader!./default-index.html';
import defaultPostbuild from '!!raw-loader!./default-postbuild.sh';
import defaultWebpackConfig from '!!raw-loader!./default-webpack.config.js';
import Handlebars from 'handlebars';
import { makeSelectBuildOption } from '../project/selectors';

export const assembleFile = (project, key, defaultValue) => {
  const content = makeSelectBuildOption(key)(project) ?? defaultValue;
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
    indexHtml: assembleFile(project, 'indexHtml', defaultIndexHtml),
    postbuild: assembleFile(project, 'postbuild', defaultPostbuild),
    webpackConfig: assembleFile(project, 'webpackConfig', defaultWebpackConfig),
    game: assembleGame(project),
  };
};

export { assembleGame, defaultIndexHtml, defaultPostbuild, defaultWebpackConfig };
