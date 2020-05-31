import { parseSync, traverse } from "@babel/core";
import generate from "@babel/generator";
import * as t from "@babel/types";
import BabelPluginProposalClassProperties from "@babel/plugin-proposal-class-properties";

const boxValue = (arg) => typeof arg === 'number' ? t.NumericLiteral(arg) : t.Identifier(arg);

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
              args.map(boxValue),
            ),
          ),
        );
      }
    }
  });

  return subtree;
};

const invokeInlineFunction = (functionAst, methodName, args, ctx) => {
  const { body } = functionAst.program;

  if (body.length !== 1) {
    throw new Error(`Expected one top-level function declaration; got ${body.length} statements`);
  }

  if (!t.isFunctionDeclaration(body[0])) {
    throw new Error(`Expected a function declaration; got ${body[0].type}`);
  }

  traverse(functionAst, {
    FunctionDeclaration(path) {
      const { node } = path;
      const { params, body, id } = node;

      path.replaceWith(
        t.ExpressionStatement(
          t.CallExpression(
            t.parenthesizedExpression(
              t.FunctionExpression(
                t.Identifier(t.isIdentifier(id) ? id.name : methodName),
                params,
                body,
              ),
            ),
            args.map(boxValue),
          ),
        ),
      );

      path.skip();
    }
  });

  return functionAst;
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

      if (fieldLabel === 'remove') {
        if (t.isMemberExpression(parent)) {
          // foo.entity.Motion.velocity_x
          throw new Error(`Unexpected compound invocation of component method ${componentLabel}.${fieldLabel}`);
        }

        if (!t.isCallExpression(parent) || parent.callee !== node) {
          // entity.Motion.add with no parens
          throw new Error(`Unexpected property lookup of component method ${componentLabel}.${fieldLabel} - it should be a method invocation`);
        }

        if (fieldLabel === 'remove') {
          // entity.Motion.remove(x)
          if (parent.arguments.length) {
            throw new Error(`Component method ${componentLabel}.${fieldLabel}() takes no arguments`);
          }

          const { removeFromEntityFn } = componentMap[component.id];

          path.parentPath.replaceWith(
            t.CallExpression(
              t.Identifier(removeFromEntityFn),
              [ entityNode ],
            ),
          );
        }
      } else {
        const field = component.fieldWithLabel(fieldLabel);

        if (!field) {
          // entity.Motion.nonexistent
          throw new Error(`Nonexistent field ${fieldLabel} on component ${componentLabel}`);
        }

        if (t.isMemberExpression(parent)) {
          // foo.entity.Motion.velocity_x
          throw new Error(`Unexpected compound lookup of component field ${componentLabel}.${fieldLabel}`);
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
    }
  }, ...(rawAst ? [] : [ast.scope, ast]));
};

export const inlineFunctionArguments = (ast, rawAst) => {
  const identical = [];
  const replacements = [];

  let sawEval = false;
  traverse(rawAst ? ast : ast.node, {
    Identifier(path) {
      if (path.node.name === 'eval') {
        sawEval = true;
      }
    }
  }, ...(rawAst ? [] : [ast.scope, ast]));

  if (sawEval) {
    return [];
  }

  traverse(rawAst ? ast : ast.node, {
    CallExpression(path) {
      const { callee: wrapper, arguments: args } = path.node;

      let callee;

      if (t.isParenthesizedExpression(wrapper)) {
        if (t.isFunctionExpression(wrapper.expression)) {
          callee = wrapper.expression;
        } else {
          throw new Error(`Expected CallExpression(ParenthesizedExpression(FunctionExpression)) or CallExpression(FunctionExpression), got CallExpression(ParenthesizedExpression(${wrapper.expression.type}))`);
        }
      } else if (t.isFunctionExpression(wrapper)) {
        callee = wrapper;
      } else {
        throw new Error(`Expected CallExpression(ParenthesizedExpression(FunctionExpression)) or CallExpression(FunctionExpression), got CallExpression(${wrapper.type})`);
      }

      const { params, body } = callee;

      const seenIdentifier = {};
      const seenAssignment = {};

      const handleParams = (path) => {
        path.node.params.forEach((param) => {
          if (t.isIdentifier(param)) {
            const { name } = param;
            seenAssignment[name] = true;
            seenIdentifier[name] = true;
          } else {
            traverse(param, {
              Identifier(subpath) {
                const { name } = subpath.node;
                seenAssignment[name] = true;
                seenIdentifier[name] = true;
              }
            }, path.scope, path);
          }
        });
      };

      traverse(body, {
        Identifier(path) {
          const { parent, node } = path;
          const { name } = node;
          if (t.isAssignmentExpression(parent) && parent.left === node) {
            seenAssignment[name] = true;
          }
          if (t.isUpdateExpression(parent)) {
            seenAssignment[name] = true;
          }
          seenIdentifier[name] = true;
        },
        FunctionDeclaration(path) { handleParams(path) },
        FunctionExpression(path) { handleParams(path) },
        ArrowFunctionExpression(path) { handleParams(path) },
      }, path.scope, path);

      const newParams = [];
      const newArgs = [];
      const replacementFor = {};

      params.forEach((param, i) => {
        const arg = args[i];
        let isSafe = true;
        let isIdentical = false;

        if (!t.isIdentifier(param)) {
          isSafe = false;
        } else {
          const { name: paramName } = param;
          if (seenAssignment[paramName]) {
            isSafe = false;
          } else if (t.isNumericLiteral(arg) || t.isStringLiteral(arg) || t.isNullLiteral(arg) || t.isBooleanLiteral(arg)) {
            replacementFor[paramName] = arg;
            replacements.push([paramName, arg.value]);
          } else if (t.isIdentifier(arg)) {
            const { name: argName } = arg;

            if (paramName === argName && isSafe) {
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
          } else {
            isSafe = false;
          }
        }

        if (!isSafe) {
          newParams.push(param);
          newArgs.push(arg);
        }
      });

      traverse(body, {
        Identifier(path) {
          if (!replacementFor.hasOwnProperty(path.node.name)) {
            return;
          }

          const replacement = replacementFor[path.node.name];

          if (typeof replacement === "object") {
            path.replaceWith(replacement);
          } else {
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
  }, ...(rawAst ? [] : [ast.scope, ast]));

  return [...identical, ...replacements];
};

export const assembleInlineSystemCall = (system, methodName, code, args, project, ctx) => {
  const { systemMap } = ctx;
  const components = systemMap[system.id].componentObjects;

  let subtree;
  let rawAst;
  if (code.func) {
    const functionAst = parseSync(code.func);
    subtree = invokeInlineFunction(functionAst, methodName, args, ctx);
    rawAst = true;
  } else if (code.file) {
    const classAst = parseSync(code.file, {
      plugins: [
        BabelPluginProposalClassProperties,
      ],
      sourceType: "module",
    });

    subtree = extractMethodSubtree(classAst, methodName, args, ctx);
    rawAst = false;
  } else {
    throw new Error('Expected object with key `func` or `file`, got ' + JSON.stringify(Object.keys(code)));
  }

  rewriteTreeToUseComponentVariables(subtree, components, null, ctx, rawAst);
  const inlinedArgs = inlineFunctionArguments(subtree, rawAst);
  const output = generate(subtree.program ?? subtree.node).code;

  return [
    `/*`,
    ` * ${system.label} ${methodName}`,
      ...inlinedArgs.map(([param, arg]) => ` *   ${param} <- ${arg}`),
    ` * Components: ${components.map(({ label }) => label).join(', ')}`,
    ` */`,
    output,
  ].join("\n");
};

export const inlineIIFEs = (code) => {
  const ast = parseSync(code);
  inlineIIFEsInTree(ast, true);
  let output = generate(ast).code;
  output = output.replace(/;$/, '');
  return output;
};

const inlineIIFEsInTree = (ast, rawAst) => {
  if (rawAst) {
    if (ast.program.body.length !== 1) {
      throw new Error(`Expected body of length 1, got ${ast.program.body.length}`);
    }
  }

  let subpath = null;
  traverse(rawAst ? ast : ast.node, {
    enter(path) {
      if (t.isProgram(path.node)) {
        return;
      } else if (t.isProgram(path.parentPath) && t.isExpressionStatement(path.node)) {
        return;
      } else if (t.isProgram(path.parentPath.parentPath) && t.isExpressionStatement(path.parentPath) && t.isArrowFunctionExpression(path.node)) {
        return;
      } else if (t.isProgram(path.parentPath.parentPath.parentPath) && t.isExpressionStatement(path.parentPath.parentPath) && t.isArrowFunctionExpression(path.parentPath) && path.listKey === 'params') {
        path.skip();
      } else if (t.isProgram(path.parentPath.parentPath.parentPath) && t.isExpressionStatement(path.parentPath.parentPath) && t.isArrowFunctionExpression(path.parentPath) && t.isBlockStatement(path.node)) {
        subpath = path;
        path.stop();
      } else {
        const parts = [];
        let p = path;
        while (p && p.node) {
          parts.unshift(p.node.type);
          p = p.parentPath;
        }

        throw new Error("Expected Program(ExpressionStatement(ArrowFunctionExpression(BlockStatement()))), got " + parts.map((p) => `${p}(`).join('') + parts.map((p) => ')').join(''));
      }
    }
  }, ...(rawAst ? [] : [ast.scope, ast]));

  let sawEval = false;
  let topLevelVars = {};
  let functionVars = {};
  subpath.node.body.forEach((node) => {
    if (sawEval) {
      return;
    }

    // eval completely blows us up
    traverse(node, {
      Identifier(path) {
        if (path.node.name === 'eval') {
          sawEval = true;
          path.stop();
        }
      }
    }, subpath.scope, subpath);

    // collect top-level vars
    if (t.isVariableDeclaration(node)) {
      node.declarations.forEach((decl) => {
        if (t.isIdentifier(decl)) {
          topLevelVars[decl.id.name] = true;
        } else {
          traverse(decl, {
            Identifier(path) {
              topLevelVars[path.node.name] = true;
            }
          }, subpath.scope, subpath);
        }
      });
    }

    const handleVariableNode = (node) => {
      if (node.kind !== 'var') {
        return;
      }

      node.declarations.forEach((decl) => {
        if (t.isIdentifier(decl.id)) {
          functionVars[decl.id.name] = true;
        } else {
          traverse(decl, {
            Identifier(path) {
              functionVars[path.node.name] = true;
            }
          }, subpath.scope, subpath);
        }
      });
    };

    if (t.isVariableDeclaration(node)) {
      handleVariableNode(node);
    }

    traverse(node, {
      FunctionDeclaration(path) {
        path.skip();
      },
      FunctionExpression(path) {
        path.skip();
      },
      ArrowFunctionExpression(path) {
        path.skip();
      },
      VariableDeclaration(path) {
        handleVariableNode(path.node);
      }
    }, subpath.scope, subpath);
  });

  if (sawEval) {
    return;
  }

  const newBody = [];
  subpath.node.body.forEach((node) => {
    if (t.isExpressionStatement(node) && t.isCallExpression(node.expression)) {
      const { callee } = node.expression;
      if (t.isFunctionExpression(callee) || t.isArrowFunctionExpression(callee)) {
        let isSafe = true;
        let interjectBlock = false;

        if (callee.params.length || node.expression.arguments.length) {
          isSafe = false;
        }

        // don't allow return
        if (isSafe) {
          traverse(callee, {
            ReturnStatement(path) {
              isSafe = false;
              path.stop();
            },
            FunctionExpression(path) {
              // ignore returns inside this function
              path.skip();
            },
            ArrowFunctionExpression(path) {
              // ignore returns inside this function
              path.skip();
            },
            FunctionDeclaration(path) {
              // ignore returns inside this function
              path.skip();
            },
          }, subpath.scope, subpath);
        }

        const newFunctionVars = { ...functionVars };
        const possibleNewTopLevelVars = {};
        const handleVariableNode = (node, path) => {
          if (node.kind !== 'var') {
            return;
          }

          node.declarations.forEach((decl) => {
            if (t.isIdentifier(decl.id)) {
              const { name } = decl.id;
              newFunctionVars[name] = true;
              possibleNewTopLevelVars[name] = true;
              if (functionVars[name] || topLevelVars[name]) {
                isSafe = false;
              }
            } else {
              traverse(decl, {
                Identifier(path) {
                  const { name } = path.node;
                  newFunctionVars[name] = true;
                  possibleNewTopLevelVars[name] = true;
                  if (functionVars[name] || topLevelVars[name]) {
                    isSafe = false;
                  }
                }
              }, path.scope, path);
            }
          });
        };

        traverse(callee.body, {
          FunctionDeclaration(path) {
            path.skip();
          },
          FunctionExpression(path) {
            path.skip();
          },
          ArrowFunctionExpression(path) {
            path.skip();
          },
          VariableDeclaration(path) {
            handleVariableNode(path.node, path);
          }
        }, subpath.scope, subpath);

        // check for variable collisions in top-level scope and collect new vars
        const newTopLevelVars = { ...topLevelVars };
        callee.body.body.forEach((node) => {
          if (t.isVariableDeclaration(node)) {
            node.declarations.forEach((decl) => {
              if (t.isIdentifier(decl)) {
                const { name } = decl.id;
                newTopLevelVars[name] = true;
                if (topLevelVars[name]) {
                  interjectBlock = true;
                }
              } else {
                traverse(decl, {
                  Identifier(path) {
                    const { name } = path.node;
                    newTopLevelVars[name] = true;
                    if (topLevelVars[name]) {
                      interjectBlock = true;
                    }
                  }
                }, subpath.scope, subpath);
              }
            });
          }
        });

        if (!interjectBlock) {
          topLevelVars = newTopLevelVars;
        }

        if (isSafe) {
          functionVars = newFunctionVars;
          topLevelVars = { ...topLevelVars, ...possibleNewTopLevelVars };

          if (interjectBlock) {
            newBody.push(t.BlockStatement(callee.body.body));
          } else {
            newBody.push(...callee.body.body);
          }
        } else {
          newBody.push(node);
        }
      } else {
        newBody.push(node);
      }
    } else {
      newBody.push(node);
    }
  });

  subpath.node.body = newBody;
};

export const flattenList = (list) => {
  return list.reduce((result, element) => (
    result.concat(Array.isArray(element) ? flattenList(element) : element)
  ), []).filter(Boolean);
};
