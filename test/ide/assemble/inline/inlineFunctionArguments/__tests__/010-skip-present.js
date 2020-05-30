// it: skips inlining when the argument identifier is reused
(function (foo) {
  let bar = 1;
})(bar)
// expects:
(function (foo) {
  let bar = 1;
})(bar);

// it: skips inlining when the argument identifier is a free variable
(function (foo) {
  console.log(bar);
})(bar)
// expects:
(function (foo) {
  console.log(bar);
})(bar);

// it: still inlines when the argument's name is used as a string
(function (foo) {
  console.log(foo, window["bar"]);
})(bar);
// expects:
(function () {
  console.log(bar, window["bar"]);
})();

// todo: still inlines when the argument's name is used as a property name
(function (foo) {
  console.log(foo, window.bar);
})(bar);
// expects:
(function () {
  console.log(bar, window.bar);
})();
