// it: doesn't change IIFEs with parameters
() => {
  (function (foo) { console.log(foo + 1) })();
}
// expects:
() => {
  (function (foo) {
    console.log(foo + 1);
  })();
}

// it: doesn't change IIFEs with arguments
() => {
  (function () { console.log(1 + 1) })(2 + 2);
}
// expects:
() => {
  (function () {
    console.log(1 + 1);
  })(2 + 2);
}

// it: doesn't change IIFEs with parameters and arguments
() => {
  (function (foo) { console.log(foo + 1) })(2 + 2);
}
// expects:
() => {
  (function (foo) {
    console.log(foo + 1);
  })(2 + 2);
}

// it: doesn't change arrow IIFEs with parameters
() => {
  (foo => { console.log(foo + 1) })();
}
// expects:
() => {
  (foo => {
    console.log(foo + 1);
  })();
}

// it: doesn't change arrow IIFEs with arguments
() => {
  (() => { console.log(1 + 1) })(2 + 2);
}
// expects:
() => {
  (() => {
    console.log(1 + 1);
  })(2 + 2);
}

// it: doesn't change arrow IIFEs with parameters and arguments
() => {
  (foo => { console.log(foo + 1) })(2 + 2);
}
// expects:
() => {
  (foo => {
    console.log(foo + 1);
  })(2 + 2);
}

// it: inlines the IIFEs that don't have parameters
() => {
  (function () { console.log(1 + 1) })();
  (function (foo) { console.log(foo + 2) })();
  (() => { console.log(3 + 3) })(4 + 4);
  (() => { console.log(5 + 5) })();
}
// expects:
() => {
  console.log(1 + 1);

  (function (foo) {
    console.log(foo + 2);
  })();

  (() => {
    console.log(3 + 3);
  })(4 + 4);

  console.log(5 + 5);
}
