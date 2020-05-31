// skip: inlines an IIFE inside a block
() => {
  {
    (function () {
      console.log(1 + 1);
    })();
  }
}
// expects:
() => {
  {
    console.log(1 + 1);
  }
}

// skip: inlines an IIFE inside an if
() => {
  if (true) {
    (function () {
      console.log(1 + 1);
    })();
  }
}
// expects:
() => {
  if (true) {
    console.log(1 + 1);
  }
}

// skip: inlines an IIFE inside a for
() => {
  for (let i = 0; i < 10; ++i) {
    (function () {
      console.log(i);
    })();
  }
}
// expects:
() => {
  for (let i = 0; i < 10; ++i) {
    console.log(i);
  }
}
