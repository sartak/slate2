// it: refuses to inline when eval is called
(function (foo) {
  eval(foo);
})(bar)
// expects:
(function (foo) {
  eval(foo);
})(bar);

// it: refuses to inline when eval is even mentioned
(function (foo) {
  const other = eval;
  other(foo);
})(bar)
// expects:
(function (foo) {
  const other = eval;
  other(foo);
})(bar);
