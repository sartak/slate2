// it: skips an IIFE that calls eval
() => {
  (function () { eval("1 + 1") })();
}
// expects:
() => {
  (function () {
    eval("1 + 1");
  })();
}

// it: skips inlining any IIFEs when it sees eval in a nested scope
() => {
  (function () { console.log(1 + 1) })();
  (function () {
    (() => {
      eval("2 + 2");
    })();
  })();
  (() => { console.log(3 + 3) })();
}
// expects:
() => {
  (function () {
    console.log(1 + 1);
  })();

  (function () {
    (() => {
      eval("2 + 2");
    })();
  })();

  (() => {
    console.log(3 + 3);
  })();
}

// it: skips inlining any IIFEs that use the eval identifier
() => {
  (function () {
    const other = eval;
    other("1 + 1");
  })();
}
// expects:
() => {
  (function () {
    const other = eval;
    other("1 + 1");
  })();
}
