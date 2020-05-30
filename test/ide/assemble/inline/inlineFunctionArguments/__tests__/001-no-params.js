// it: handles no params/args
(function () {})()
// expects:
(function () {})();

// it: handles no params/args with a named function
(function foo () {})()
// expects:
(function foo() {})();
