// it: cannot peel off a parameter array
(function ([foo]) {
  console.log(foo);
})(bar)
// expects:
(function ([foo]) {
  console.log(foo);
})(bar);

// it: cannot peel off a parameter dictionary
(function ({foo}) {
  console.log(foo);
})(bar)
// expects:
(function ({
  foo
}) {
  console.log(foo);
})(bar);
