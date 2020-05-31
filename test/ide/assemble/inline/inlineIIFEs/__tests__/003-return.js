// it: keeps an IIFE that returns
() => {
  (function () {
    return 1 + 1;
  })();
}
// expects:
() => {
  (function () {
    return 1 + 1;
  })();
}

// it: keeps an arrow IIFE that returns
() => {
  (() => {
    return 1 + 1;
  })();
}
// expects:
() => {
  (() => {
    return 1 + 1;
  })();
}

// it: inlines an IIFE that returns only from an inner function expression
() => {
  (function () {
    console.log(1 + 1);
    (function () {
      return 2 + 2;
    })();
    console.log(3 + 3);
  })();
}
// expects:
() => {
  console.log(1 + 1);

  (function () {
    return 2 + 2;
  })();

  console.log(3 + 3);
}

// it: skips inlining IIFE that returns outside an inner function expression
() => {
  (function () {
    console.log(1 + 1);
    (function () {
      return 2 + 2;
    })();
    return 3 + 3;
  })();
}
// expects:
() => {
  (function () {
    console.log(1 + 1);

    (function () {
      return 2 + 2;
    })();

    return 3 + 3;
  })();
}

// it: inlines an IIFE that returns only from an inner arrow function
() => {
  (function () {
    console.log(1 + 1);
    (() => {
      return 2 + 2;
    })();
    console.log(3 + 3);
  })();
}
// expects:
() => {
  console.log(1 + 1);

  (() => {
    return 2 + 2;
  })();

  console.log(3 + 3);
}

// it: inlines an IIFE that returns only from an inner function declaration
() => {
  (function () {
    console.log(1 + 1);
    function inner() {
      return 2 + 2;
    }
    inner();
    console.log(3 + 3);
  })();
}
// expects:
() => {
  console.log(1 + 1);

  function inner() {
    return 2 + 2;
  }

  inner();
  console.log(3 + 3);
}
