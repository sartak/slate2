// it: skips an IIFE whose value is assigned
() => {
  const res = (function () { 1 + 1 })();
  console.log(res);
}
// expects:
() => {
  const res = function () {
    1 + 1;
  }();

  console.log(res);
}

// it: skips an arrow IIFE whose value is assigned
() => {
  const res = (() => 1 + 1)();
  console.log(res);
}
// expects:
() => {
  const res = (() => 1 + 1)();

  console.log(res);
}

// it: skips an IIFE that isn't actually called
() => {
  (function () { 1 + 1 });
}
// expects:
() => {
  (function () {
    1 + 1;
  });
}

// it: skips an arrow IIFE that isn't actually called
() => {
  (() => { 1 + 1 });
}
// expects:
() => {
  () => {
    1 + 1;
  };
}
