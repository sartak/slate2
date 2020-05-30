// it: skips when there's a defaulted but reused param in a nested function expression
(function (foo, bar) {
  (function (foo = 3) {
    console.log(foo, bar);
  })(1);
  console.log(foo, bar);
})(2, 4)
// expects:
(function (foo) {
  (function (foo = 3) {
    console.log(foo, 4);
  })(1);

  console.log(foo, 4);
})(2);

// it: skips when there's a defaulted but reused param in a nested arrow function
(function (foo, bar) {
  ((foo = 3) => {
    console.log(foo, bar);
  })(1);
  console.log(foo, bar);
})(2, 4)
// expects:
(function (foo) {
  ((foo = 3) => {
    console.log(foo, 4);
  })(1);

  console.log(foo, 4);
})(2);

// it: skips when there's a defaulted but reused param in a nested function declaration
(function (foo, bar) {
  function inner(foo = 3) {
    console.log(foo, bar);
  }
  console.log(foo, bar);
  inner(1);
})(2, 4)
// expects:
(function (foo) {
  function inner(foo = 3) {
    console.log(foo, 4);
  }

  console.log(foo, 4);
  inner(1);
})(2);

// skip: inlines only outer function leaving the defaulted but reused param in a nested function expression
(function (foo, bar) {
  (function (foo = 3) {
    console.log(foo, bar);
  })(1);
  console.log(foo, bar);
})(2, 4)
// expects:
(function () {
  (function (foo = 3) {
    console.log(foo, 4);
  })(1);

  console.log(2, 4);
})();

// skip: inlines only outer function leaving the defaulted but reused param in a nested arrow function
(function (foo, bar) {
  ((foo = 3) => {
    console.log(foo, bar);
  })(1);
  console.log(foo, bar);
})(2, 4)
// expects:
(function () {
  ((foo = 3) => {
    console.log(foo, 4);
  })(1);

  console.log(2, 4);
})();

// skip: inlines only outer function leaving the defaulted but reused param in a nested function declaration
(function (foo, bar) {
  function inner(foo = 3) {
    console.log(foo, bar);
  }
  console.log(foo, bar);
  inner(1);
})(2, 4)
// expects:
(function () {
  function inner(foo = 3) {
    console.log(foo, 4);
  }

  console.log(2, 4);
  inner(1);
})();
