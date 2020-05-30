// it: handles basic renaming
(function (foo) {
  console.log(foo);
})(bar)
// expects:
(function () {
  console.log(bar);
})();

// it: inlines when the arg and param names match
(function (foo) {
  console.log(foo);
})(foo)
// expects:
(function () {
  console.log(foo);
})();

// it: handles multiple params and args
(function (foo1, foo2) {
  console.log(foo1, foo2);
})(bar1, bar2)
// expects:
(function () {
  console.log(bar1, bar2);
})();

// it: handles multiple uses of the params and args
(function (foo1, foo2) {
  console.log(foo2, foo1);
  console.log(foo1, foo2);
})(bar1, bar2)
// expects:
(function () {
  console.log(bar2, bar1);
  console.log(bar1, bar2);
})();

// it: doesn't get confused by strings
(function (foo) {
  console.log(foo, "foo");
})(bar)
// expects:
(function () {
  console.log(bar, "foo");
})();
