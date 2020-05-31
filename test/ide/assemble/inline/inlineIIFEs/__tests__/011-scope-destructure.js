// it: inlines IIFEs that destructure top-level variables 
() => {
  (function () {
    var [a] = [1 + 1];
    let [b] = [2 + 2];
    const [c] = [3 + 3];
    console.log(a + b + c);
  })();
}
// expects:
() => {
  var [a] = [1 + 1];
  let [b] = [2 + 2];
  const [c] = [3 + 3];
  console.log(a + b + c);
}

// it: inlines two IIFEs that destructure disjoint variables
() => {
  (function () {
    var [a] = [1 + 1];
    let [b] = [2 + 2];
    const [c] = [3 + 3];
    console.log(a + b + c);
  })();
  (function () {
    var [d] = [4 + 4];
    let [e] = [5 + 5];
    const [f] = [6 + 6];
    console.log(d + e + f);
  })();
}
// expects:
() => {
  var [a] = [1 + 1];
  let [b] = [2 + 2];
  const [c] = [3 + 3];
  console.log(a + b + c);
  var [d] = [4 + 4];
  let [e] = [5 + 5];
  const [f] = [6 + 6];
  console.log(d + e + f);
}

// it: interjects a block when top-level destructured const is reused
() => {
  const [a] = [1 + 1];
  (function () {
    const [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  const [a] = [1 + 1];
  {
    const [a] = [2 + 2];
    console.log(a);
  }
}

// it: interjects a block when top-level destructured let is reused
() => {
  let [a] = [1 + 1];
  (function () {
    let [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  let [a] = [1 + 1];
  {
    let [a] = [2 + 2];
    console.log(a);
  }
}

// it: interjects a block when top-level destructured const is reused from a previous IIFE
() => {
  (function () {
    const [a] = [1 + 1];
    console.log(a);
  })();
  (function () {
    const [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  const [a] = [1 + 1];
  console.log(a);
  {
    const [a] = [2 + 2];
    console.log(a);
  }
}

// it: interjects a block when top-level destructured let is reused from a previous IIFE
() => {
  (function () {
    let [a] = [1 + 1];
    console.log(a);
  })();
  (function () {
    let [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  let [a] = [1 + 1];
  console.log(a);
  {
    let [a] = [2 + 2];
    console.log(a);
  }
}

// it: doesn't pollute the namespace with destructured consts that don't get inlined
() => {
  (function () {
    const [a] = [1 + 1];
    console.log(a);
  })();
  (function () {
    const [a] = [2 + 2];
    const [b] = [3 + 3];
    console.log(a, b);
  })();
  (function () {
    const [b] = [4 + 4];
    console.log(b);
  })();
}
// expects:
() => {
  const [a] = [1 + 1];
  console.log(a);
  {
    const [a] = [2 + 2];
    const [b] = [3 + 3];
    console.log(a, b);
  }
  const [b] = [4 + 4];
  console.log(b);
}

// it: doesn't pollute the namespace with destructured lets that don't get inlined
() => {
  (function () {
    let [a] = [1 + 1];
    console.log(a);
  })();
  (function () {
    let [a] = [2 + 2];
    let [b] = [3 + 3];
    console.log(a, b);
  })();
  (function () {
    let [b] = [4 + 4];
    console.log(b);
  })();
}
// expects:
() => {
  let [a] = [1 + 1];
  console.log(a);
  {
    let [a] = [2 + 2];
    let [b] = [3 + 3];
    console.log(a, b);
  }
  let [b] = [4 + 4];
  console.log(b);
}

// it: interjects a block when one of multiple destructures is reused from a previous IIFE
() => {
  (function () {
    let [a] = [1 + 1], [b] = [2 + 2];
    console.log(b);
  })();
  (function () {
    let [b] = [3 + 3];
    console.log(b);
  })();
}
// expects:
() => {
  let [a] = [1 + 1],
      [b] = [2 + 2];
  console.log(b);
  {
    let [b] = [3 + 3];
    console.log(b);
  }
}

// it: interjects a block when a multi-destructures is reused from a previous IIFE
() => {
  (function () {
    let [a, b] = [1 + 1, 2 + 2];
    console.log(b);
  })();
  (function () {
    let [b, c] = [3 + 3, 4 + 4];
    console.log(b);
  })();
}
// expects:
() => {
  let [a, b] = [1 + 1, 2 + 2];
  console.log(b);
  {
    let [b, c] = [3 + 3, 4 + 4];
    console.log(b);
  }
}
