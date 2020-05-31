// it: 
() => {
  {
    var a = 1 + 1;
  }
  (function () {
    var a = 2 + 2;
    console.log(a);
  })();
}
// expects:
() => {
  {
    var a = 1 + 1;
  }

  (function () {
    var a = 2 + 2;
    console.log(a);
  })();
}

// it: 
() => {
  var a = 1 + 1;
  (function () {
    {
      var a = 2 + 2;
      console.log(a);
    }
  })();
}
// expects:
() => {
  var a = 1 + 1;

  (function () {
    {
      var a = 2 + 2;
      console.log(a);
    }
  })();
}

// it: 
() => {
  (function () {
    {
      var a = 1 + 1;
      console.log(a);
    }
  })();
  (function () {
    {
      var a = 2 + 2;
      console.log(a);
    }
  })();
}
// expects:
() => {
  {
    var a = 1 + 1;
    console.log(a);
  }

  (function () {
    {
      var a = 2 + 2;
      console.log(a);
    }
  })();
}

// it: 
() => {
  (function () {
    {
      var a = 1 + 1;
      console.log(a);
    }
  })();
  (function () {
    {
      var a = 2 + 2;
      var b = 3 + 3;
      console.log(a, b);
    }
  })();
  (function () {
    {
      var b = 4 + 4;
      console.log(b);
    }
  })();
}
// expects:
() => {
  {
    var a = 1 + 1;
    console.log(a);
  }

  (function () {
    {
      var a = 2 + 2;
      var b = 3 + 3;
      console.log(a, b);
    }
  })();

  {
    var b = 4 + 4;
    console.log(b);
  }
}

// it: 
() => {
  (function () {
    {
      var a = 1 + 1, b = 2 + 2;
      console.log(b);
    }
  })();
  (function () {
    {
      var b = 3 + 3;
      console.log(b);
    }
  })();
}
// expects:
() => {
  {
    var a = 1 + 1,
        b = 2 + 2;
    console.log(b);
  }

  (function () {
    {
      var b = 3 + 3;
      console.log(b);
    }
  })();
}
