import assert from 'assert';
import { describe, it } from 'mocha';
import { inlineFunctionArguments } from '@ide/assemble/inline';
import { parseSync } from "@babel/core";
import generate from "@babel/generator";

const testFiles = (ctx => {
  let keys = ctx.keys();
  let values = keys.map(ctx);
  return keys.reduce((o, k, i) => { o[k] = values[i].default; return o; }, {});
})(require.context('./inlineFunctionArguments/__tests__', false, /\.js$/));

const inlineEquals = (input, expected) => {
  const ast = parseSync(Array.isArray(input) ? input.join("\n") : input);
  inlineFunctionArguments(ast, true);
  const output = generate(ast).code;
  assert.equal(output, Array.isArray(expected) ? expected.join("\n") : expected);
};

Object.keys(testFiles).sort().forEach((file) => {
  describe(file, () => {
    const blocks = [];

    const newBlock = () => ({
      name: null,
      input: [],
      expected: [],
      sawDivider: false,
      skip: false,
    });

    let block = newBlock();

    testFiles[file].split("\n").forEach((line, i) => {
      const match = line.match(/^\s*\/\/\s*(it|skip|todo):\s*(.+)$/i);
      if (match) {
        if (i > 0) {
          blocks.push(block);
          block = newBlock();
        }

        block.skip = match[1].toLowerCase() !== "it";
        block.name = match[2];
      } else if (line.match(/^\s*\/\/\s*expects:\s*$/i)) {
        block.sawDivider = true;
      } else if (block.sawDivider) {
        block.expected.push(line);
      } else {
        block.input.push(line);
      }
    });

    blocks.push(block);

    blocks.forEach(({ name, skip, input, expected }) => {
      // trim surrounding newlines
      while (input[0] === "") {
        input.shift();
      }
      while (input[input.length - 1] === "") {
        input.pop();
      }
      while (expected[0] === "") {
        expected.shift();
      }
      while (expected[expected.length - 1] === "") {
        expected.pop();
      }

      const fn = skip ? it.skip : it;
      fn(name, () => {
        inlineEquals(input, expected);
      });
    });
  });
});
