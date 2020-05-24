import { parseSync, traverse } from "@babel/core";
import generate from "@babel/generator";
import * as t from "@babel/types";
import BabelPluginProposalClassProperties from "@babel/plugin-proposal-class-properties";

const extractMethodSubtree = (classAst, methodName, args, ctx) => {
  let subtree;

  traverse(classAst, {
    ClassMethod(path) {
      const { node } = path;

      if (t.isIdentifier(node.key) && node.key.name === methodName) {
        subtree = path;

        path.replaceWith(
          t.ExpressionStatement(
            t.CallExpression(
              t.parenthesizedExpression(
                t.FunctionExpression(
                  t.Identifier(methodName),
                  node.params,
                  node.body,
                ),
              ),
              args.map((arg) => t.Identifier(arg)),
            ),
          ),
        );
      }
    }
  });

  return subtree;
};

export const rewriteCodeToUseComponentVariables = (code, components, componentDictionaryLookup, ctx) => {
  const ast = parseSync(code);
  rewriteTreeToUseComponentVariables(ast, components, componentDictionaryLookup, ctx, true);
  return generate(ast).code;
};

const rewriteTreeToUseComponentVariables = (ast, components, componentDictionaryLookup, ctx, rawAst) => {
  const { componentMap } = ctx;

  const componentByLabel = {};
  components.forEach((component) => {
    componentByLabel[component.label] = component;
  });

  traverse((rawAst ? ast : ast.node), {
    MemberExpression(path) {
      const { parent, node } = path;
      const { object: primary, property } = node;

      if (componentDictionaryLookup && t.isExpression(primary) && !t.isMemberExpression(primary) && t.isIdentifier(property)) {
        const entityNode = primary;
        const componentNode = property;

        if (componentNode.computed) {
          // entity["Motion"]
          return;
        }

        const componentLabel = componentNode.name;

        if (!componentByLabel[componentLabel]) {
          // entity.Nonexistent
          return;
        }

        if (t.isMemberExpression(parent)) {
          // foo.entity.Motion
          // We don't throw an exception here because false positives are
          // more likely.
          return;
        }

        if (t.isCallExpression(parent) && parent.callee == node) {
          // entity.Motion()
          // We don't throw an exception here because false positives are
          // more likely.
          return;
        }

        path.replaceWith(
          t.CallExpression(
            t.Identifier(componentDictionaryLookup),
            [
              t.stringLiteral(componentLabel),
              entityNode,
            ],
          ),
        );
        path.skip();

        return;
      }

      if (!t.isMemberExpression(primary) || !t.isIdentifier(property)) {
        return;
      }

      const fieldNode = property;
      const { object: entityNode, property: componentNode } = primary;

      if (!t.isIdentifier(componentNode)) {
        return;
      }

      // Now we know we have a pattern of two consecutive lookups `a.b.c`
      // though `a`, the entity var, can be a complex expression like
      // `entities[i]`

      if (node.computed || primary.computed) {
        // entity["Motion"].velocity_x or entity.Motion["velocity_x"]
        return;
      }

      const componentLabel = componentNode.name;
      const fieldLabel = fieldNode.name;

      if (!componentByLabel[componentLabel]) {
        // entity.Nonexistent.velocity_x
        return;
      }

      // Now at this point we know we have a true positive and we switch from
      // excluding

      const component = componentByLabel[componentLabel];
      const field = component.fieldWithLabel(fieldLabel);

      if (!field) {
        // entity.Motion.nonexistent
        throw new Error(`Nonexistent field ${fieldLabel} on component ${componentLabel}`);
      }

      if (t.isMemberExpression(parent)) {
        // foo.entity.Motion.velocity_x
        throw new Error(`Unexpected compound lookup of component field ${componentLabel}.${fieldName}`);
      }

      if (t.isCallExpression(parent) && parent.callee == node) {
        // entity.Motion.velocity_x()
        throw new Error(`Unexpected method invocation of component field ${componentLabel}.${fieldName}(…) - it should just be a property lookup`);
      }

      const fieldVarName = componentMap[component.id].fieldVarNames[field.id];
      const match = fieldVarName.match(/^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)$/);
      if (match) {
        const [, componentVarName, fieldPropertyName] = match;
        path.replaceWith(
          t.MemberExpression(
            t.MemberExpression(t.Identifier(componentVarName), t.Identifier(fieldPropertyName), false),
            entityNode,
            true,
          ),
        );
      }
      else {
        path.replaceWith(
          t.MemberExpression(t.Identifier(fieldVarName), entityNode, true),
        );
      }
    }
  }, ...(rawAst ? [] : [ast.scope, ast]));
};

const inlineFunctionArguments = (ast, ctx) => {
  const identical = [];
  const replacements = [];

  traverse(ast.node, {
    CallExpression(path) {
      const { callee: wrapper, arguments: args } = path.node;

      if (!t.isParenthesizedExpression) {
        throw new Error("Expected CallExpression(ParenthesizedExpression(FunctionExpression))");
      }

      if (!t.isFunctionExpression(wrapper.expression)) {
        throw new Error("Expected CallExpression(ParenthesizedExpression(FunctionExpression))");
      }

      const callee = wrapper.expression;
      const { params, body } = callee;

      const seenIdentifier = {};
      const seenAssignment = {};

      traverse(body, {
        Identifier(path) {
          const { parent, node } = path;
          const { name } = node;
          if (t.isAssignmentExpression(parent) && parent.left === node) {
            seenAssignment[name] = true;
          }
          seenIdentifier[name] = true;
        }
      }, path.scope, path);

      const newParams = [];
      const newArgs = [];
      const replacementFor = {};

      params.forEach((param, i) => {
        const arg = args[i];
        let isSafe = true;
        let isIdentical = false;

        if (!t.isIdentifier(param) || !t.isIdentifier(arg)) {
          isSafe = false;
        } else {
          const { name: paramName } = param;
          const { name: argName } = arg;

          if (seenAssignment[paramName]) {
            isSafe = false;
          } else if (paramName === argName && isSafe) {
            isIdentical = true;
          } else if (seenIdentifier[argName]) {
            isSafe = false;
          }

          if (isSafe) {
            if (isIdentical) {
              identical.push([paramName, argName]);
            } else {
              replacementFor[paramName] = argName;
              replacements.push([paramName, argName]);
            }
          }
        }

        if (!isSafe) {
          newParams.push(param);
          newArgs.push(arg);
        }
      });

      traverse(body, {
        Identifier(path) {
          const replacement = replacementFor[path.node.name];
          if (replacement) {
            path.node.name = replacement;
          }
        }
      }, path.scope, path);

      // report that we dropped extra args
      args.slice(params.length).forEach((arg) => {
        replacements.push(['_', generate(arg).code]);
      });

      path.node.arguments = newArgs;
      callee.params = newParams;

      // Only do this at the top level.
      path.skip();
    }
  }, ast.scope, ast.parent);

  return [...identical, ...replacements];
};

export const assembleInlineSystemCall = (system, methodName, classCode, args, project, ctx) => {
  const { systemMap } = ctx;
  const components = systemMap[system.id].componentObjects;

  const classAst = parseSync(classCode, {
    plugins: [
      BabelPluginProposalClassProperties,
    ],
    sourceType: "module",
  });

  const subtree = extractMethodSubtree(classAst, methodName, args, ctx);
  rewriteTreeToUseComponentVariables(subtree, components, null, ctx);
  const inlinedArgs = inlineFunctionArguments(subtree, ctx);
  const output = generate(subtree.node).code;

  return [
    `/*`,
    ` * ${system.label} ${methodName}`,
      ...inlinedArgs.map(([param, arg]) => ` *   ${param} <- ${arg}`),
    ` * Components: ${components.map(({ label }) => label).join(', ')}`,
    ` */`,
    output,
  ].join("\n");
};

export const flattenList = (list) => {
  return list.reduce((result, element) => (
    result.concat(Array.isArray(element) ? flattenList(element) : element)
  ), []).filter(Boolean);
};
