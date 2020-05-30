// it: inlines only the outer function with a nested default-param function expression
(function (foo) {
  (function (baz = 1) {
    console.log(foo, baz);
  })(quux);
})(bar)
// expects:
(function () {
  (function (baz = 1) {
    console.log(bar, baz);
  })(quux);
})();

// it: inlines only the outer function with a nested default-param arrow function
(function (foo) {
  ((baz = 1) => {
    console.log(foo, baz);
  })(quux);
})(bar)
// expects:
(function () {
  ((baz = 1) => {
    console.log(bar, baz);
  })(quux);
})();

// it: inlines only the outer function with a nested default-param function declaration
(function (foo) {
  function inner(baz = 1) {
    console.log(foo, baz);
  }
  inner(quux);
})(bar)
// expects:
(function () {
  function inner(baz = 1) {
    console.log(bar, baz);
  }

  inner(quux);
})();
