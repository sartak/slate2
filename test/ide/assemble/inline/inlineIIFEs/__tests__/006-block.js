// it: skips an IIFE in a nested block
() => {
  {
    (function () { console.log(1 + 1) })();
  }
}
// expects:
() => {
  {
    (function () {
      console.log(1 + 1);
    })();
  }
}
