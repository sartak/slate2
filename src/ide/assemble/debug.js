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
  });
};

export const assembleDebugCall = (methodName, rest, project, ctx) => {
  const { debuggers, debuggerMap } = ctx;
  const assembleMethod = `assemble_${methodName}`;

  return debuggers.map((debug, i) => {
    const map = debuggerMap[i];
    const { varName } = map;
    return [
      (debug.__proto__[methodName] && `${varName}.${methodName}${rest}`),
      ...(debug.__proto__[assembleMethod] ? debug[assembleMethod](map, project, ctx) : []),
    ].filter(Boolean).join("\n");
  }).filter((c) => c.length);
};

export const assembleDebuggers = (project, ctx) => {
  const { debuggers, debuggerMap } = ctx;
  const { generateDebuggerVars } = project;

  const attach = assembleDebugCall('attach', '(...args);', project, ctx).filter(Boolean);

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

    ...(generateDebuggerVars ? [
      `const ${ctx.debuggersVar} = [`,
        ...debuggers.map((_, i) => `${debuggerMap[i].varName},`),
      `];`,
    ] : []),
  ];
};
