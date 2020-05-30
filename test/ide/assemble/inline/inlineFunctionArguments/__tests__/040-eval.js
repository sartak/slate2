// it: refuses to inline when there's an eval
(function (foo) {
  eval(foo);
})(bar)
// expects:
(function (foo) {
  eval(foo);
})(bar);
