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

const parameterizeBody = (originalBody, paramMap) => {
  let body = originalBody;
  const params = [];
  const args = [];

  paramMap.forEach(([param, arg]) => {
    let safe = true;

    // If we already used a variable with the parameter name
    if (param !== arg && body.match(new RegExp(`\\b${arg}\\b`))) {
      safe = false;
    }
    // If we reassign the argument, we want a standalone copy of it.
    else if (body.match(new RegExp(`\\b${param}\\s*(\\+|-|\\*\\*?|/|%)?=[^=]`))) {
      safe = false;
    }
    // @Consider: When would else it be unsafe to rewrite?

    if (safe) {
      // param === arg happens for variables like `dt` and `time`
      if (param !== arg) {
        body = body.replace(new RegExp(`\\b${param}\\b`, 'g'), arg);
      }
    } else {
      params.push(param);
      args.push(arg);
    }
  });

  // We always wrap in a function to get the safety of not having to worry
  // about `var` scope, other variable name reuse, and so on. However, the
  // terser minifier will replace immediately-invoked function expressions when
  // they're simple enough, like when they have no parameters.
  const wrapPre = `(function (${params.join(', ')}) {`;
  const wrapPost = `})(${args});`;

  return [wrapPre, body, wrapPost].join("\n");
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

  const componentizedBody = rewriteBodyToUseComponentVariables(system, body, components, ctx);
  const parameterizedBody = parameterizeBody(componentizedBody, paramMap);

  return [
    `/*`,
    ` * ${system.name} ${method_name}`,
    ...paramMap.map(([param, arg]) => ` *   ${param} <= ${arg}`),
    ` * Components: ${components.map((c) => c.name).join(', ')}`,
    ` */`,
    parameterizedBody,
  ].join("\n");
};
