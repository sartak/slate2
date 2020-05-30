// it: skips inlining reassigned parameter variables
(function (foo) {
  foo = 1;
})(bar)
// expects:
(function (foo) {
  foo = 1;
})(bar);

// it: still inlines non-reassigned parameter variables
(function (foo1, foo2) {
  foo1 = 1;
  console.log(foo1, foo2);
})(bar1, bar2)
// expects:
(function (foo1) {
  foo1 = 1;
  console.log(foo1, bar2);
})(bar1);

// it: skips inlining when parameter uses +=
(function (foo) {
  foo += 1;
})(bar)
// expects:
(function (foo) {
  foo += 1;
})(bar);

// it: skips inlining when parameter uses -=
(function (foo) {
  foo -= 1;
})(bar)
// expects:
(function (foo) {
  foo -= 1;
})(bar);

// it: skips inlining when parameter uses *=
(function (foo) {
  foo *= 1;
})(bar)
// expects:
(function (foo) {
  foo *= 1;
})(bar);

// it: skips inlining when parameter uses /=
(function (foo) {
  foo /= 1;
})(bar)
// expects:
(function (foo) {
  foo /= 1;
})(bar);

// it: skips inlining when parameter uses %=
(function (foo) {
  foo %= 1;
})(bar)
// expects:
(function (foo) {
  foo %= 1;
})(bar);

// it: skips inlining when parameter uses <<=
(function (foo) {
  foo <<= 1;
})(bar)
// expects:
(function (foo) {
  foo <<= 1;
})(bar);

// it: skips inlining when parameter uses >>=
(function (foo) {
  foo >>= 1;
})(bar)
// expects:
(function (foo) {
  foo >>= 1;
})(bar);

// it: skips inlining when parameter uses >>>=
(function (foo) {
  foo >>>= 1;
})(bar)
// expects:
(function (foo) {
  foo >>>= 1;
})(bar);

// it: skips inlining when parameter uses &=
(function (foo) {
  foo &= 1;
})(bar)
// expects:
(function (foo) {
  foo &= 1;
})(bar);

// it: skips inlining when parameter uses |=
(function (foo) {
  foo |= 1;
})(bar)
// expects:
(function (foo) {
  foo |= 1;
})(bar);

// it: skips inlining when parameter uses ^=
(function (foo) {
  foo ^= 1;
})(bar)
// expects:
(function (foo) {
  foo ^= 1;
})(bar);

// it: skips inlining when parameter uses prefix increment
(function (foo) {
  ++foo;
})(bar)
// expects:
(function (foo) {
  ++foo;
})(bar);

// it: skips inlining when parameter uses postfix increment
(function (foo) {
  foo++;
})(bar)
// expects:
(function (foo) {
  foo++;
})(bar);

// it: skips inlining when parameter uses prefix decrement
(function (foo) {
  --foo;
})(bar)
// expects:
(function (foo) {
  --foo;
})(bar);

// it: skips inlining when parameter uses postfix decrement
(function (foo) {
  foo--;
})(bar)
// expects:
(function (foo) {
  foo--;
})(bar);
