export default class ReplayDebugger {
  label = "replay";
  replay = null;
  frameIndex = null;
  frameSubscriptions = [];
  assembly = null;

  prepareAssembly(map, project, ctx) {
    const { varName } = map;
    ctx.assembleCaptureEmitFn = (label, expression, assembleSetter, isKeyframe) => {
      const emit = isKeyframe ? 'emitKeyframe' : 'emit';
      if (!assembleSetter) {
        console.warn(`No setter for ${label}; replays may ignore it. To suppress this pass a () => [] setter.`);
        return [];
      }
      return assembleSetter(`${varName}.${emit}(${JSON.stringify(label)})`)
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

  emitKeyframe(key) {
    const { keyframe } = this.frame;
    if (!keyframe) {
      return null;
    }

    return keyframe[key];
  }

  subscribeToFrame(callback) {
    this.frameSubscriptions.push(callback);

    return () => {
      this.frameSubscriptions = this.frameSubscriptions.filter((cb) => cb !== callback);
    };
  }

  setFrameIndex(index) {
    const { assembly, replay } = this;
    const { entities: assemblyEntities, entityIndexLookup: assemblyEntityLookup, systems: assemblySystems } = assembly;
    const { frames } = replay;

    let keyframeIndex = index;
    if (!frames[index].keyframe) {
      for (keyframeIndex = index - 1; keyframeIndex >= 0; --keyframeIndex) {
        if (frames[keyframeIndex].keyframe) {
          break;
        }
      }
    }

    this.frameIndex = keyframeIndex;
    const frame = this.frame = frames[keyframeIndex];

    assemblyEntities.splice(frame.keyframe.entityList.length);
    frame.keyframe.entityList.forEach((entity, i) => {
      assemblyEntities[i] = entity;
    });

    for (var entity in assemblyEntityLookup) delete assemblyEntityLookup[entity];
    Object.entries(frame.keyframe.entityLookup).forEach(([entity, index]) => {
      assemblyEntityLookup[entity] = index;
    });

    Object.entries(frame.keyframe.components).forEach(([componentId, fields]) => {
      const assemblyComponent = assembly.components[componentId];
      Object.entries(fields).forEach(([fieldId, values]) => {
        const assemblyField = assemblyComponent[fieldId];
        assemblyField.splice(values.length);
        values.forEach((value, i) => {
          assemblyField[i] = value;
        });
      });
    });

    Object.entries(frame.keyframe.systemEntities).forEach(([systemId, entities]) => {
      const system = assemblySystems[systemId];
      const { entities: systemEntities } = system;
      systemEntities.splice(entities.length);
      entities.forEach((entity, i) => {
        systemEntities[i] = entity;
      });
    });

    for (let i = keyframeIndex; i < index; ++i) {
      // Skip rendering
      assembly.step(0, 0, true);

      // @Performance: capture more fine-grained keyframes
    }
  }
}
