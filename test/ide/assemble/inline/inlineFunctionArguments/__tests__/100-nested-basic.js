// it: inlines only the outer function with a nested function expression
(function (foo) {
  (function (baz) {
    console.log(foo, baz);
  })(quux);
})(bar)
// expects:
(function () {
  (function (baz) {
    console.log(bar, baz);
  })(quux);
})();

// it: inlines only the outer function with a nested arrow function
(function (foo) {
  (baz => {
    console.log(foo, baz);
  })(quux);
})(bar)
// expects:
(function () {
  (baz => {
    console.log(bar, baz);
  })(quux);
})();

// it: inlines only the outer function with a nested function declaration
(function (foo) {
  function inner(baz) {
    console.log(foo, baz);
  }
  inner(quux);
})(bar)
// expects:
(function () {
  function inner(baz) {
    console.log(bar, baz);
  }

  inner(quux);
})();
