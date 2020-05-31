// it: 
() => {
  {
    (function () {
      var a = 1 + 1;
    })();
  }
  (function () {
    var a = 2 + 2;
    console.log(a);
  })();
}
// expects:
() => {
  {
    (function () {
      var a = 1 + 1;
    })();
  }
  var a = 2 + 2;
  console.log(a);
}

// it: 
() => {
  var a = 1 + 1;
  (function () {
    console.log(2 + 2);
    (function () {
      var a = 3 + 3;
      console.log(a);
    })();
    console.log(4 + 4);
  })();
}
// expects:
() => {
  var a = 1 + 1;
  console.log(2 + 2);

  (function () {
    var a = 3 + 3;
    console.log(a);
  })();

  console.log(4 + 4);
}

// it: 
() => {
  (function () {
    (function () {
      var a = 1 + 1;
      console.log(a);
    })();
  })();
  (function () {
    var a = 2 + 2;
    console.log(a);
  })();
}
// expects:
() => {
  (function () {
    var a = 1 + 1;
    console.log(a);
  })();

  var a = 2 + 2;
  console.log(a);
}

// it: 
() => {
  (function () {
    (function () {
      var a = 1 + 1;
      console.log(a);
    })();
  })();
  (function () {
    var a = 2 + 2;
    var b = 3 + 3;
    console.log(a, b);
  })();
  (function () {
    var b = 4 + 4;
    console.log(b);
  })();
}
// expects:
() => {
  (function () {
    var a = 1 + 1;
    console.log(a);
  })();

  var a = 2 + 2;
  var b = 3 + 3;
  console.log(a, b);

  (function () {
    var b = 4 + 4;
    console.log(b);
  })();
}
