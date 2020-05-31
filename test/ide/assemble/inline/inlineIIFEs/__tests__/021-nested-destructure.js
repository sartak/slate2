// it: 
() => {
  (function () {
    {
      var [a] = [1 + 1];
      let [b] = [2 + 2];
      const [c] = [3 + 3];
      console.log(a + b + c);
    }
  })();
}
// expects:
() => {
  {
    var [a] = [1 + 1];
    let [b] = [2 + 2];
    const [c] = [3 + 3];
    console.log(a + b + c);
  }
}

// it: 
() => {
  (function () {
    {
      var [a] = [1 + 1];
      let [b] = [2 + 2];
      const [c] = [3 + 3];
      console.log(a + b + c);
    }
  })();
  (function () {
    {
      var [d] = [4 + 4];
      let [e] = [5 + 5];
      const [f] = [6 + 6];
      console.log(d + e + f);
    }
  })();
}
// expects:
() => {
  {
    var [a] = [1 + 1];
    let [b] = [2 + 2];
    const [c] = [3 + 3];
    console.log(a + b + c);
  }
  {
    var [d] = [4 + 4];
    let [e] = [5 + 5];
    const [f] = [6 + 6];
    console.log(d + e + f);
  }
}

// it: 
() => {
  {
    const [a] = [1 + 1];
  }
  (function () {
    const [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  {
    const [a] = [1 + 1];
  }
  const [a] = [2 + 2];
  console.log(a);
}

// it: 
() => {
  {
    let [a] = [1 + 1];
  }
  (function () {
    let [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  {
    let [a] = [1 + 1];
  }
  let [a] = [2 + 2];
  console.log(a);
}

// it: 
() => {
  (function () {
    {
      const [a] = [1 + 1];
      console.log(a);
    }
  })();
  (function () {
    const [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  {
    const [a] = [1 + 1];
    console.log(a);
  }
  const [a] = [2 + 2];
  console.log(a);
}

// it: 
() => {
  (function () {
    {
      let [a] = [1 + 1];
      console.log(a);
    }
  })();
  (function () {
    let [a] = [2 + 2];
    console.log(a);
  })();
}
// expects:
() => {
  {
    let [a] = [1 + 1];
    console.log(a);
  }
  let [a] = [2 + 2];
  console.log(a);
}

// it: 
() => {
  (function () {
    {
      const [a] = [1 + 1];
      console.log(a);
    }
  })();
  (function () {
    {
      const [a] = [2 + 2];
      const [b] = [3 + 3];
      console.log(a, b);
    }
  })();
  (function () {
    const [b] = [4 + 4];
    console.log(b);
  })();
}
// expects:
() => {
  {
    const [a] = [1 + 1];
    console.log(a);
  }
  {
    const [a] = [2 + 2];
    const [b] = [3 + 3];
    console.log(a, b);
  }
  const [b] = [4 + 4];
  console.log(b);
}

// it: 
() => {
  (function () {
    {
      let [a] = [1 + 1];
      console.log(a);
    }
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
  {
    let [a] = [1 + 1];
    console.log(a);
  }
  let [a] = [2 + 2];
  let [b] = [3 + 3];
  console.log(a, b);
  {
    let [b] = [4 + 4];
    console.log(b);
  }
}

// it: 
() => {
  (function () {
    {
      let [a] = [1 + 1], [b] = [2 + 2];
      console.log(b);
    }
  })();
  (function () {
    let [b] = [3 + 3];
    console.log(b);
  })();
}
// expects:
() => {
  {
    let [a] = [1 + 1],
        [b] = [2 + 2];
    console.log(b);
  }
  let [b] = [3 + 3];
  console.log(b);
}

// it: 
() => {
  (function () {
    {
      let [a, b] = [1 + 1, 2 + 2];
      console.log(b);
    }
  })();
  (function () {
    let [b, c] = [3 + 3, 4 + 4];
    console.log(b);
  })();
}
// expects:
() => {
  {
    let [a, b] = [1 + 1, 2 + 2];
    console.log(b);
  }
  let [b, c] = [3 + 3, 4 + 4];
  console.log(b);
}
