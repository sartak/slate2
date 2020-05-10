import { createStore } from 'redux';

const projectReducer = (state = null, action) => {
  switch (action.type) {
    case 'create-new': {
      return {"code": "On Error Resume Next\n\n' draw a line\nDim x As Integer\nDim y As Integer\n\nx = 150\ny = 150\n"};
    }
    case 'canvas': {
      return {...state, canvas: action.canvas};
    }
    case 'code': {
      const {code} = action;
      let result;
      try {
        const {canvas} = state;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.width;

        const moveTo = (...args) => ctx.moveTo(...args);
        const lineTo = (...args) => ctx.lineTo(...args);
        const stroke = (...args) => ctx.stroke(...args);
        const beginPath = (...args) => ctx.beginPath(...args);
        const arc = (...args) => ctx.arc(...args);

        let c = code;
        c = c.replace(/On Error Resume Next/ig, "");
        c = c.replace(/\bDim\b/ig, "var");
        c = c.replace(/\bAs Integer\b/ig, "");
        c = c.replace(/\n/g, ";\n");
        c = c.replace(/^\s*'/mg, "//");

        console.log(c);
        eval(c);
        return {...state, code, error: null};
      } catch (error) {
        return {...state, code, error};
      }
    }
    default: {
      return state;
    }
  }
}

export const projectStore = createStore(projectReducer);
