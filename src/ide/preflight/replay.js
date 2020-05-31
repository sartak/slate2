export default class ReplayDebugger {
  label = "replay";
  replay = null;
  frameIndex = null;
  frameSubscriptions = [];
  assembly = null;

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

  didUpdateAssembly(project, assembly) {
    this.assembly = assembly;
  }

  preflightStart(assembly, replay) {
    this.replay = replay;
    this.frameIndex = 0;
    console.log(`Starting replay of ${replay.frames.length} frames`);
  }

  preflightStop() {
    this.frameSubscriptions.forEach((cb) => cb(null, 0));
  }

  assemble_frameBegin(map, project, ctx) {
    const { varName } = map;
    return [
      `${ctx.dtStepVar} = ${varName}.emit('dt');`,
      `${ctx.timeStepVar} = ${varName}.emit('time');`,
    ];
  }

  assemble_updateBeforeLoop(map, project, ctx) {
    const { varName } = map;
    return [
      `${ctx.timeUpdateVar} = ${varName}.emit('timeUpdate');`,
      `${ctx.lagUpdateVar} = ${varName}.emit('lagUpdate');`,
    ];
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
    const { frameIndex } = this;
    const frame = this.frame = this.replay.frames[frameIndex];
    this.frameSubscriptions.forEach((cb) => cb(frame, frameIndex));
  }

  frameEnd() {
    this.frameIndex++;
    if (this.frameIndex === this.replay.frames.length) {
      if (this.replay.onEnd() === false) {
        console.log(`Finished replay of ${this.replay.frames.length} frames`);
      }
    }
  }

  emit(key) {
    return this.frame[key];
  }

  subscribeToFrame(callback) {
    this.frameSubscriptions.push(callback);

    return () => {
      this.frameSubscriptions = this.frameSubscriptions.filter((cb) => cb !== callback);
    };
  }

  setFrameIndex(index) {
    const { assembly } = this;
    this.frameIndex = index;
    const frame = this.frame = this.replay.frames[index];
    Object.entries(frame.components).forEach(([componentId, fields]) => {
      const assemblyComponent = assembly.components[componentId];
      Object.entries(fields).forEach(([fieldId, values]) => {
        const assemblyField = assemblyComponent[fieldId];
        values.forEach((value, i) => {
          assemblyField[i] = value;
        });
      });
    });
  }
}
