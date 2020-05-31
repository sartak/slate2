export const prepareDebuggers = (project, ctx) => {
  const { prefix, debuggerClassPrefix, debuggerVars, debuggerMap } = ctx;

  if (!project.debuggers?.length) {
    return;
  }

  project.debuggers.forEach((debug, i) => {
    const varName = `${prefix}debugger${i}_${debug.label}`;
    const className = `${debuggerClassPrefix}Debug${i}`;

    ctx.imports.push([className, debug.path, true]);

    debuggerVars.push(varName);

    ctx.debuggers.push(debug);
    debuggerMap[i] = {
      debug,
      varName,
      className,
    };

    debug.prepareAssembly?.(debuggerMap[i], project, ctx);
  });
};

export const assembleDebugCall = (methodName, rest, project, ctx, quiet = false) => {
  const { debuggers, debuggerMap } = ctx;
  const assembleMethod = `assemble_${methodName}`;

  return [
    (quiet ? '' : `/* begin ${methodName} phase */`),
    ...debuggers.map((debug, i) => {
      const map = debuggerMap[i];
      const { varName } = map;

      let assembly = [
        (debug.__proto__[methodName] && `${varName}.${methodName}${rest}`),
        ...(debug.__proto__[assembleMethod] ? [
          (quiet ? null : `/* begin ${debug.label} ${assembleMethod}() */`),
          ...debug[assembleMethod](map, project, ctx),
          (quiet ? null : `/* end ${debug.label} ${assembleMethod}() */`),
        ] : []),
      ].filter(Boolean);

      if (assembly.length && debug.__proto__.wrapAssembly) {
        assembly = debug.wrapAssembly(assembly, map, project, ctx).filter(Boolean);
      }

      return assembly.join("\n");
    }).filter((c) => c.length),
    (quiet ? '' : `/* end ${methodName} phase */`),
  ];
};

export const assembleDebuggers = (project, ctx) => {
  const { debuggers, debuggerMap } = ctx;
  const { generateDebuggerVars } = project;

  const attach = assembleDebugCall('attach', '(...args);', project, ctx, true).filter(Boolean);

  return [
    ...debuggers.map((debug, i) => {
      const { varName, className } = debuggerMap[i];

      return [
        (generateDebuggerVars && `const ${varName} = new ${className}();`),

        ...(attach.length ?
          [
            `${ctx.gameClass}.prototype.attachDebug = function (...args) {`,
              ...attach,
              `return this;`,
            `};`,
          ]
        : []),
      ];
    }),

    ...debuggers.map((debug, i) => debug.assemblePreflightInit?.(debuggerMap[i], project, ctx)),

    ...(generateDebuggerVars ? [
      `const ${ctx.debuggersVar} = [`,
        ...debuggers.map((_, i) => `${debuggerMap[i].varName},`),
      `];`,
    ] : []),
  ];
};

export const assembleDebugPreflightReturn = (project, ctx) => {
  const { debuggers, debuggerMap } = ctx;
  return debuggers.map((debug, i) => debug.assemblePreflightReturn?.(debuggerMap[i], project, ctx));
};
