export const prepareCommand = (project, ctx) => {
  const { init } = ctx;

  ctx.commandKeys = {};

  init.unshift((ctx) => {
    const { commandKeys, commandKeysVar } = ctx;
    return [
      `const ${commandKeysVar} = {`,
        ...Object.entries(commandKeys).map(([name, keys]) => (
          `${JSON.stringify(name)}: [${keys.map((key) => JSON.stringify(key)).join(', ')}],`
        )),
      `};`,
    ].join("\n");
  });
};

export const assembleCommandSetup = (project, ctx) => {
  return [
  ];
};

export const assembleCommandStepPrepare = (project, ctx) => {
  const { commandKeys, commandFrameVar, commandPressedFn, forPreflight } = ctx;
  return [
    `const ${commandFrameVar} = {`,
      ...Object.keys(commandKeys).map((name) => (
        `${JSON.stringify(name)}: false,`
      )),
    `};`,
    `const ${commandPressedFn} = (name) => {`,
      ...(forPreflight ? [
        `if (!(name in ${commandFrameVar})) {`,
          `console.error("No command named '" + name + "' found");`,
          `return false;`,
        `}`,
      ] : []),

      `return ${commandFrameVar}[name];`,
    `};`,
  ];
};
