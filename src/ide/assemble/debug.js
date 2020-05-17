export const prepareDebuggers = (project, ctx) => {
  const { prefix, debuggerClassPrefix, debuggerVars, debuggerMap } = ctx;

  if (!project.debuggers?.length) {
    return;
  }

  project.debuggers.forEach((debug, i) => {
    const varName = `${prefix}debugger_${i}`;
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

  return debuggers.map((debug, i) => {
    if (!debug.__proto__[methodName]) {
      return null;
    }

    return `${debuggerMap[i].varName}.${methodName}${rest}`;
  });
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
