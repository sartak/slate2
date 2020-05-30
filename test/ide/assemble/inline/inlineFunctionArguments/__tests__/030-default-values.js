// it: avoids inlining if the parameter could use its default
(function (foo = 1) {
  console.log(foo);
})(bar)
// expects:
(function (foo = 1) {
  console.log(foo);
})(bar);

// todo: does inline if the parameter cannot use its default
(function (foo = 1) {
  console.log(foo);
})(2)
// expects:
(function () {
  console.log(2);
})();

// todo: early parameters can be filled in
(function (foo1 = 1, foo2 = 2) {
  console.log(foo1, foo2);
})(5, bar);
// expects:
(function (foo2 = 1) {
  console.log(5, foo2);
})(bar);

// todo: latter parameters can be filled in
(function (foo1 = 1, foo2 = 2) {
  console.log(foo1, foo2);
})(bar, 5);
// expects:
(function (foo1 = 1) {
  console.log(foo1, 5);
})(bar);
