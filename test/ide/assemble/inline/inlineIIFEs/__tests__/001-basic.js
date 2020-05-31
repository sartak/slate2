// it: inlines a basic IIFE
() => {
  (function () { console.log(1 + 1) })();
}
// expects:
() => {
  console.log(1 + 1);
}

// it: handles multiple statements
() => {
  (function () {
    console.log(1 + 1);
    console.log(2 + 2);
  })();
}
// expects:
() => {
  console.log(1 + 1);
  console.log(2 + 2);
}

// it: handles conditionals
() => {
  (function () {
    if (2 + 2 === 5) {
      console.log(1 + 1);
    } else {
      console.log(2 + 2);
    }
  })();
}
// expects:
() => {
  if (2 + 2 === 5) {
    console.log(1 + 1);
  } else {
    console.log(2 + 2);
  }
}

// it: handles nested blocks
() => {
  (function () {
    if (2 + 2 === 5) {
      let res = 2 + 2;
      console.log(res);
      res++;
      console.log(res);
    }
  })();
}
// expects:
() => {
  if (2 + 2 === 5) {
    let res = 2 + 2;
    console.log(res);
    res++;
    console.log(res);
  }
}

// it: interleaves with non-function statements
() => {
  console.log(1 + 1);
  (function () {
    console.log(2 + 2);
  })();
  console.log(3 + 3);
}
// expects:
() => {
  console.log(1 + 1);
  console.log(2 + 2);
  console.log(3 + 3);
}

// it: handles arrow functions too
() => {
  console.log(1 + 1);
  (() => {
    console.log(2 + 2);
  })();
  console.log(3 + 3);
}
// expects:
() => {
  console.log(1 + 1);
  console.log(2 + 2);
  console.log(3 + 3);
}

// it: inlines multiple IIFEs
() => {
  console.log(1 + 1);
  (function () {
    console.log(2 + 2);
  })();
  (() => {
    console.log(3 + 3);
  })();
  console.log(4 + 4);
}
// expects:
() => {
  console.log(1 + 1);
  console.log(2 + 2);
  console.log(3 + 3);
  console.log(4 + 4);
}

// it: inlines IIFEs when the wrapper has parameters
foo => {
  (function () {
    console.log(1 + 1);
  })();
}
// expects:
foo => {
  console.log(1 + 1);
}
