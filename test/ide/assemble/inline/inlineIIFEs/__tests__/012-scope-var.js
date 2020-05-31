// it: keeps the inline function when top-level var is reused
() => {
  var a = 1 + 1;
  (function () {
    var a = 2 + 2;
    console.log(a);
  })();
}
// expects:
() => {
  var a = 1 + 1;

  (function () {
    var a = 2 + 2;
    console.log(a);
  })();
}

// it: keeps the inline function when top-level var is reused from a previous IIFE
() => {
  (function () {
    var a = 1 + 1;
    console.log(a);
  })();
  (function () {
    var a = 2 + 2;
    console.log(a);
  })();
}
// expects:
() => {
  var a = 1 + 1;
  console.log(a);

  (function () {
    var a = 2 + 2;
    console.log(a);
  })();
}

// it: doesn't pollute the namespace with vars that don't get inlined
() => {
  (function () {
    var a = 1 + 1;
    console.log(a);
  })();
  (function () {
    var a = 2 + 2;
    var b = 3 + 3;
    console.log(a, b);
  })();
  (function () {
    var b = 4 + 4;
    console.log(b);
  })();
}
// expects:
() => {
  var a = 1 + 1;
  console.log(a);

  (function () {
    var a = 2 + 2;
    var b = 3 + 3;
    console.log(a, b);
  })();

  var b = 4 + 4;
  console.log(b);
}

// it: interjects a block when one of multiple declarations is reused from a previous IIFE
() => {
  (function () {
    var a = 1 + 1, b = 2 + 2;
    console.log(b);
  })();
  (function () {
    var b = 3 + 3;
    console.log(b);
  })();
}
// expects:
() => {
  var a = 1 + 1,
      b = 2 + 2;
  console.log(b);

  (function () {
    var b = 3 + 3;
    console.log(b);
  })();
}
