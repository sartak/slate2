export default class RecordDebugger {
  label = "replay";
  replay = null;
  frameIndex = null;

  prepareAssembly(map, project, ctx) {
    const { varName } = map;
    ctx.assembleCaptureEmitFn = (label, expression, assembleSetter) => {
      if (!assembleSetter) {
        console.warn(`No setter for ${label}; replays may ignore it. To suppress this pass a () => [] setter.`);
        return [];
      }
      return assembleSetter(`${varName}.emit(${JSON.stringify(label)})`)
    };
  }

  preflightStart(assembly, replay) {
    this.replay = replay;
    this.frameIndex = 0;
    console.log(`Starting replay of ${replay.frames.length} frames`);
  }

  assemble_inputEnd(map, project, ctx) {
    const { commandFrameVar } = ctx;
    const { varName } = map;
    return [
      `Object.entries(${varName}.emit('command')).forEach(([name, down]) => {`,
        `${commandFrameVar}[name] = down;`,
      `});`,
    ];
  }

  assemble_updateEnd(map, project, ctx) {
    const { componentsVar } = ctx;
    const { varName } = map;

    if (false) { // verbose checking
      return [
        `Object.entries(${varName}.emit('components')).forEach(([componentId, fields]) => {`,
          `Object.entries(fields).forEach(([fieldId, values]) => {`,
            `values.forEach((expected, entity) => {`,
              `const got = ${componentsVar}[componentId][fieldId][entity];`,
              `if (got !== expected) {`,
                `console.log(\`Entity value mispatch for entity \${entity} component \${componentId} field \${fieldId}; got '\${got}' expected '\${expected}'\`);`,
              `}`,
            `});`,
          `});`,
        `});`,
      ];
    }

    return [];
  }

  frameBegin() {
    this.frame = this.replay.frames[this.frameIndex];
  }

  frameEnd() {
    this.frameIndex++;
    if (this.frameIndex === this.replay.frames.length) {
      console.log(`Finished replay of ${this.replay.frames.length} frames`);
      this.replay.onEnd();
    }
  }

  emit(key) {
    return this.frame[key];
  }
}
