const testFiles = (ctx => {
  let keys = ctx.keys();
  let values = keys.map(ctx);
  return keys.reduce((o, k, i) => { o[k] = values[i].default; return o; }, {});
})(require.context('./inlineIIFEs/__tests__', false, /\.js$/));

import assert from 'assert';
import { describe, it } from 'mocha';
import { inlineIIFEs } from '@ide/assemble/inline';

const inlineEquals = (input, expected) => {
  const output = inlineIIFEs(Array.isArray(input) ? input.join("\n") : input);
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
