// returns [method name, [params], body]
const parseSystemCall = (code) => {
  // @Bugfix: This will break if a method attempts to use a default value that
  // uses parentheses in its expression.
  const parse = code.match(/^\s*function\s*([a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{\s*(.*)\s*}\s*$/s);
  if (!parse) {
    return;
  }

  parse[2] = parse[2].split(/\s*,\s*/);
  return parse.slice(1);
};

const rewriteBodyToUseComponentVariables = (system, originalBody, components, ctx) => {
  // @Bugfix: This optimistically assumes that any pattern of
  // word1.componentName.word2 is a lookup of component field word2 for entity
  // word1. I don't really see this hitting as a false negative, but the fix
  // would involve manipulating the AST instead of the raw string code.
  let body = originalBody;
  components.forEach((component) => {
    const componentName = component.name;
    body = body.replace(new RegExp(`\\b([a-zA-Z0-9_]+)\.${componentName}\.([a-zA-Z0-9_]+)\\b`, 'g'), (_, entityVar, fieldName) => {
      const componentFieldVar = ctx.componentFieldVars[componentName][fieldName];
      if (!componentFieldVar) {
        throw new Error(`System ${system.name} tried to use non-existent component ${componentName} field var ${fieldName}`);
      }
      return `${componentFieldVar}[${entityVar}]`;
    });
  });
  return body;
};

export const assembleInlineSystemCall = (system, method_name, args, project, ctx) => {
  const components = system.requiredComponents;
  const code = String(system.prototype[method_name]);
  const parse = parseSystemCall(code);

  if (!parse) {
    throw new Error(`Could not parse ${system.name}System.${method_name} for inlining`);
  }

  const [, params, body] = parse;
  const paramMap = params.map((p, i) => [p, args[i]]);

  const wrapPre = `(function (${params}) {`;
  const wrapPost = `})(${args});`;

  const componentizedBody = rewriteBodyToUseComponentVariables(system, body, components, ctx);

  return [
    `/*`,
    ` * ${system.name} ${method_name}`,
    ...paramMap.map(([param, arg]) => ` *   ${param} <= ${arg}`),
    ` * Components: ${components.map((c) => c.name).join(', ')}`,
    ` */`,
    wrapPre,
    componentizedBody,
    wrapPost,
  ].join("\n");
};
