export const projectReducer = (state = null, action) => {
  switch (action.type) {
    case 'create-project': {
      return {
        renderer: 'canvas',
      };
    }
    case 'load-project': {
      return action.project;
    }
    case 'set-renderer': {
      return {...state, renderer: action.renderer};
    }
    default: {
      return state;
    }
  }
};
