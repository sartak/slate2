export const projectReducer = (state = null, action) => {
  switch (action.type) {
    case 'create-project': {
      return {
        code: '',
        renderer: 'canvas',
      };
    }
    case 'load-project': {
      return action.project;
    }
    case 'change-code': {
      return {...state, code: action.code};
    }
    case 'set-renderer': {
      return {...state, renderer: action.renderer};
    }
    default: {
      return state;
    }
  }
};
