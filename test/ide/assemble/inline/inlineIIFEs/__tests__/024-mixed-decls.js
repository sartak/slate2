// it: doesn't inline let/var variables that collide
() => {
  let a = 1;
  (function () {
    var a = 2;
  })();
}
// expects:
() => {
  let a = 1;

  (function () {
    var a = 2;
  })();
}

// it: does inline let/var variables that don't collide
() => {
  {
    let a = 1;
  }
  (function () {
    var a = 2;
  })();
}
// expects:
() => {
  {
    let a = 1;
  }
  var a = 2;
}

// it: doesn't inline let/var variables that collide in a nested block
() => {
  let a = 1;
  (function () {
    {
      var a = 2;
    }
  })();
}
// expects:
() => {
  let a = 1;

  (function () {
    {
      var a = 2;
    }
  })();
}

// it: does inline let/var variables that don't collide in a nested block
() => {
  {
    let a = 1;
  }
  (function () {
    {
      var a = 2;
    }
  })();
}
// expects:
() => {
  {
    let a = 1;
  }
  {
    var a = 2;
  }
}

// it: does inline let/var variables that collide in a nested function
() => {
  let a = 1;
  (function () {
    (function () {
      var a = 2;
    })();
  })();
}
// expects:
() => {
  let a = 1;

  (function () {
    var a = 2;
  })();
}

// it: doesn't inline subsequent IIFEs
() => {
  (function () {
    let a = 1;
  })();
  (function () {
    {
      var a = 2;
    }
  })();
}
// expects:
() => {
  let a = 1;

  (function () {
    {
      var a = 2;
    }
  })();
}

// it: does inline subsequent IIFEs when the let is nested
() => {
  (function () {
    {
      let a = 1;
    }
  })();
  (function () {
    {
      var a = 2;
    }
  })();
}
// expects:
() => {
  {
    let a = 1;
  }
  {
    var a = 2;
  }
}

// it: interjects a block when a subsequent IIFE's top-level let sees a var
() => {
  (function () {
    {
      var a = 1;
    }
  })();
  (function () {
    let a = 2;
  })();
}
// expects:
() => {
  {
    var a = 1;
  }
  {
    let a = 2;
  }
}
