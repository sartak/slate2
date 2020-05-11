import defaultIndexHtml from '!!raw-loader!./default-index.html';
import defaultWebpackConfig from '!!raw-loader!./default-webpack.config.js';

export const projectReducer = (state = null, action) => {
  switch (action.type) {
    case 'create-project': {
      return {};
    }
    case 'load-project': {
      return action.project;
    }
    case 'change-code': {
      return {...state, code: action.code};
    }
    default: {
      return state;
    }
  }
};

export { defaultIndexHtml, defaultWebpackConfig };
