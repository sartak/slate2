// it: inlines IIFEs that destructure top-level vars 
() => {
  (function () {
    var [a] = [1 + 1];
    console.log(a);
  })();
}
// expects:
() => {
  var [a] = [1 + 1];
  console.log(a);
}

// it: inlines two IIFEs that destructure disjoint vars
() => {
  (function () {
    var [a] = [1 + 1];
    console.log(a);
  })();
  (function () {
    var [b] = [2 + 2];
    console.log(b);
  })();
}
// expects:
() => {
  var [a] = [1 + 1];
  console.log(a);
  var [b] = [2 + 2];
  console.log(b);
}

// it: keeps the inline function when top-level destructured var is reused
() => {
  var [a] = [1 + 1];
  (function () {
    var [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  var [a] = [1 + 1];

  (function () {
    var [a] = [2 + 2];
    console.log(a);
  })();
}

// it: keeps the inline function when top-level destructured var is reused from a previous IIFE
() => {
  (function () {
    var [a] = [1 + 1];
    console.log(a);
  })();
  (function () {
    var [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  var [a] = [1 + 1];
  console.log(a);

  (function () {
    var [a] = [2 + 2];
    console.log(a);
  })();
}

// it: doesn't pollute the namespace with destructured vars that don't get inlined
() => {
  (function () {
    var [a] = [1 + 1];
    console.log(a);
  })();
  (function () {
    var [a] = [2 + 2];
    var [b] = [3 + 3];
    console.log(a, b);
  })();
  (function () {
    var [b] = [4 + 4];
    console.log(b);
  })();
}
// expects:
() => {
  var [a] = [1 + 1];
  console.log(a);

  (function () {
    var [a] = [2 + 2];
    var [b] = [3 + 3];
    console.log(a, b);
  })();

  var [b] = [4 + 4];
  console.log(b);
}

// it: interjects a block when one of multiple destructures is reused from a previous IIFE
() => {
  (function () {
    var [a] = [1 + 1], [b] = [2 + 2];
    console.log(b);
  })();
  (function () {
    var [b] = [3 + 3];
    console.log(b);
  })();
}
// expects:
() => {
  var [a] = [1 + 1],
      [b] = [2 + 2];
  console.log(b);

  (function () {
    var [b] = [3 + 3];
    console.log(b);
  })();
}

// it: interjects a block when a multi-destructures is reused from a previous IIFE
() => {
  (function () {
    var [a, b] = [1 + 1, 2 + 2];
    console.log(b);
  })();
  (function () {
    var [b, c] = [3 + 3, 4 + 4];
    console.log(b);
  })();
}
// expects:
() => {
  var [a, b] = [1 + 1, 2 + 2];
  console.log(b);

  (function () {
    var [b, c] = [3 + 3, 4 + 4];
    console.log(b);
  })();
}
