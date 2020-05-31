export default class RecordDebugger {
  label = "record";
  recording = null;

  prepareAssembly(map, project, ctx) {
    const { varName } = map;
    ctx.assembleCaptureEmitFn = (label, expression, assembleSetter) => {
      return [
        `${varName}.capture(${JSON.stringify(label)}, ${expression});`,
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
      `${varName}.captureComponents(${ctx.componentsVar});`,
    ];
  }

  frameBegin() {
    this.frame = {};
  }

  capture(key, value) {
    this.frame[key] = JSON.parse(JSON.stringify(value));
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

  captureComponents(components) {
    this.capture('components', components);
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

    const evals = frames.map(({ evals }) => evals).filter((evals) => evals.length).flat();
    const entityValueUpdates = frames.map(({ entityValueUpdates }) => entityValueUpdates).filter((entityValueUpdates) => entityValueUpdates.length).flat();

    const summaryFields = [
      [frames.length, 'frames'],
      [evals.length, 'evals'],
      [entityValueUpdates.length, 'entity value updates'],
    ];

    const summary = summaryFields.filter(([count]) => count).map(([count, label]) => `${count} ${label}`).join(', ');
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
