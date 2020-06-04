export default class RandomDebugger {
  label = 'random';

  // https://github.com/bryc/code/blob/master/jshash/PRNGs.md
  // mulberry32
  srand(a) {
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // xmur3
  seedify(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }

    return () => {
      h = Math.imul(h ^ h >>> 16, 2246822507),
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
    }
  }

  seed(str) {
    const generator = this.seedify(str);
    return generator();
  }

  prepareAssembly(map, project, ctx) {
    ctx.seedVar = `${ctx.prefix}seedValue`;
    ctx.randomVar = `${ctx.prefix}rand`;
  }

  assemblePreflightInit(map, project, ctx) {
    const { varName } = map;
    const { randomVar, seedVar } = ctx;

    // @Incomplete: We should capture this seedVar in the top-level recording
    // and replay, since init functions can use it.
    return [
      `const ${seedVar} = ${varName}.seed(String(Math.random()));`,
      `const ${randomVar} = ${varName}.srand(${seedVar});`,
      `const ${randomVar}Outer = ${randomVar};`,
    ];
  }

  assemble_frameBegin(map, project, ctx) {
    const { varName } = map;
    const { randomVar, seedVar, assembleCaptureEmitFn } = ctx;

    return [
      ...assembleCaptureEmitFn(
        'randomSeed',
        () => [
          `const ${seedVar} = ${randomVar}Outer() * Math.pow(2, 32);`,
          seedVar,
        ],
        (val) => [`const ${seedVar} = ${val};`],
      ),
      `const ${randomVar} = ${varName}.srand(${seedVar});`,
    ];
  }
}
