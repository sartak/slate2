// todo: can peel off a parameter array with an argument array
(function ([foo]) {
  console.log(foo);
})([bar])
// expects:
(function () {
  console.log(bar);
})();

// todo: can peel off a parameter dictionary with a dictionary array
(function ({foo}) {
  console.log(foo);
})({foo: bar})
// expects:
(function () {
  console.log(bar);
})();

