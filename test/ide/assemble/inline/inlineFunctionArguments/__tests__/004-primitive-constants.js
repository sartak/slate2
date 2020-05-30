// it: drops unused constant arguments
(function () {})(42, "hello")
// expects:
(function () {})();

// it: inlines an integer argument
(function (foo) {
  console.log(foo);
})(42)
// expects:
(function () {
  console.log(42);
})();

// it: inlines multiple float arguments
(function (foo1, foo2) {
  console.log(foo1, foo2);
})(1.0, 2.0)
// expects:
(function () {
  console.log(1.0, 2.0);
})();

// it: inlines string arguments
(function (foo1, foo2) {
  console.log(foo1, foo2);
})("hello", 'world')
// expects:
(function () {
  console.log("hello", 'world');
})();

// it: inlines other basic constants (null, true, etc)
(function (a, b, c, d) {
  console.log(a, b, c, d);
})(null, undefined, true, false)
// expects:
(function () {
  console.log(null, undefined, true, false);
})();

// it: skips inlining constants that are modified
(function (i) {
  i++;
})(41)
// expects:
(function (i) {
  i++;
})(41);
