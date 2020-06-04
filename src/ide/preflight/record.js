export default class RecordDebugger {
  label = "record";
  recording = null;

  prepareAssembly(map, project, ctx) {
    const { varName } = map;
    ctx.assembleCaptureEmitFn = (label, expression, assembleSetter, isKeyframe) => {
      const capture = isKeyframe ? 'captureKeyframe' : 'capture';
      if (typeof expression === 'function') {
        const [generator, value] = expression();
        return [
          generator,
          `${varName}.${capture}(${JSON.stringify(label)}, ${value});`,
        ];
      }

      return [
        `${varName}.${capture}(${JSON.stringify(label)}, ${expression});`,
      ];
    };
  }

  preflightStart(assembly) {
    this.recording = {
      frames: [],
      assemblyCode: assembly.code,
    };
  }

  assemble_frameBegin(map, project, ctx) {
    const { varName } = map;
    return [
      `${varName}.captureStepTime(${ctx.dtStepVar}, ${ctx.timeStepVar});`,
    ];
  }

  assemble_updateBeforeLoop(map, project, ctx) {
    const { varName } = map;
    return [
      `${varName}.captureUpdateTime(${ctx.timeUpdateVar}, ${ctx.lagUpdateVar});`,
    ];
  }

  assemble_inputEnd(map, project, ctx) {
    const { commandFrameVar } = ctx;
    const { varName } = map;
    return [
      `${varName}.captureInput(${commandFrameVar});`,
    ];
  }

  assemble_updateEnd(map, project, ctx) {
    const { varName } = map;
    return [
      `${varName}.captureEntities(${ctx.entitiesVar}, ${ctx.entityIndexLookupVar});`,
      `${varName}.captureComponents(${ctx.componentsVar});`,
      `${varName}.captureSystemEntities(${ctx.systemsVar});`,
    ];
  }

  frameBegin() {
    this.frame = {
      keyframe: {},
    };
  }

  capture(key, value) {
    this.frame[key] = JSON.parse(JSON.stringify(value));
  }

  captureKeyframe(key, value) {
    if (this.frame.keyframe) {
      this.frame.keyframe[key] = JSON.parse(JSON.stringify(value));
    }
  }

  captureStepTime(dt, time) {
    this.capture('dt', dt);
    this.capture('time', time);
  }

  captureUpdateTime(timeUpdate, lagUpdate) {
    this.capture('timeUpdate', timeUpdate);
    this.capture('lagUpdate', lagUpdate);
  }

  captureInput(command) {
    this.capture('command', command);
  }

  captureEntities(entityList, entityLookup) {
    this.captureKeyframe('entityList', entityList);
    this.captureKeyframe('entityLookup', entityLookup);
  }

  captureComponents(components) {
    this.captureKeyframe('components', components);
  }

  captureSystemEntities(systems) {
    const systemEntities = {};
    Object.entries(systems).forEach(([systemId, system]) => {
      systemEntities[systemId] = system.entities;
    });
    this.captureKeyframe('systemEntities', systemEntities);
  }

  frameEnd() {
    this.recording.frames.push(this.frame);
    this.frame = null;
  }

  preflightStop() {
    const { recording, frame: leftoverFrame } = this;
    const { frames } = recording;

    if (leftoverFrame) {
      console.error("Preflight stopped mid-frame; this shouldn't happen");
    }

    const keyframes = frames.map(({ keyframe }, i) => [keyframe, i]).filter(([keyframe]) => keyframe);
    const evals = frames.map(({ evals }) => evals).filter((evals) => evals.length).flat();
    const entityValueUpdates = frames.map(({ entityValueUpdates }) => entityValueUpdates).filter((entityValueUpdates) => entityValueUpdates.length).flat();

    const summaryFields = [
      [frames.length, 'frames'],
      [keyframes.length, 'keyframes'],
      [evals.length, 'evals'],
      [entityValueUpdates.length, 'entity value updates'],
    ];

    let summary = summaryFields.filter(([count]) => count).map(([count, label]) => `${count} ${label}`).join(', ');
    if (keyframes.length) {
      summary += `, first keyframe ${keyframes[0][1]}, last keyframe ${keyframes[keyframes.length - 1][1]}`;
    }

    if (summary) {
      console.log(`Captured ${summary}`);
    }
  }

  provideRecording() {
    const { recording } = this;
    this.recording = null;
    return recording;
  }
}
