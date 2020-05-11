export const projectReducer = (state = null, action) => {
  switch (action.type) {
    case 'create-project': {
      return {};
    }
    case 'load-project': {
      return action.project;
    }
    default: {
      return state;
    }
  }
}
