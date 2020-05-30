// it: skips when there's a reused param in a nested function expression
(function (foo) {
  (function ([foo]) {
    console.log(foo);
  })([1]);
  console.log(foo);
})(2)
// expects:
(function (foo) {
  (function ([foo]) {
    console.log(foo);
  })([1]);

  console.log(foo);
})(2);

// it: skips when there's a reused param in a nested arrow function
(function (foo) {
  (([foo]) => {
    console.log(foo);
  })([1]);
  console.log(foo);
})(2)
// expects:
(function (foo) {
  (([foo]) => {
    console.log(foo);
  })([1]);

  console.log(foo);
})(2);

// it: skips when there's a reused param in a nested function declaration
(function (foo) {
  function inner([foo]) {
    console.log(foo);
  }
  console.log(foo);
  inner([1]);
})(2)
// expects:
(function (foo) {
  function inner([foo]) {
    console.log(foo);
  }

  console.log(foo);
  inner([1]);
})(2);

// skip: inlines only outer function leaving the reused param in a nested function expression
(function (foo) {
  (function ([foo]) {
    console.log(foo);
  })([1]);
  console.log(foo);
})(2)
// expects:
(function () {
  (function ([foo]) {
    console.log(foo);
  })([1]);

  console.log(2);
})();

// skip: inlines only outer function leaving the reused param in a nested arrow function
(function (foo) {
  (([foo]) => {
    console.log(foo);
  })([1]);
  console.log(foo);
})(2)
// expects:
(function () {
  (([foo]) => {
    console.log(foo);
  })([1]);

  console.log(2);
})();

// skip: inlines only outer function leaving the reused param in a nested function declaration
(function (foo) {
  function inner([foo]) {
    console.log(foo);
  }
  console.log(foo);
  inner([1]);
})(2)
// expects:
(function () {
  function inner([foo]) {
    console.log(foo);
  }

  console.log(2);
  inner([1]);
})();

