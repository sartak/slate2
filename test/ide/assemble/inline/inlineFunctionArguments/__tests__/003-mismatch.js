// it: removes an extra argument
(function () {})(bar1)
// expects:
(function () {})();

// it: peels off arguments that are matched to parameters
(function (foo) {
  console.log(foo);
})(bar1, bar2)
// expects:
(function () {
  console.log(bar1);
})();

// it: keeps any unprovided parameters
(function (foo1, foo2) {
  console.log(foo1, foo2);
})(bar1)
// expects:
(function (foo2) {
  console.log(bar1, foo2);
})();
