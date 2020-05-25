export default class RecordDebugger {
  label = "record";

  preflightStart() {
    this.capturedFrames = [];
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
      `${varName}.captureKeyframe(${ctx.componentsVar});`,
    ];
  }

  assemble_cleanupBegin(map, project, ctx) {
    const { varName } = map;
    return [
      `${varName}.captureEval(${ctx.evalVar});`,
    ];
  }

  frameBegin() {
    this.frame = {};
  }

  captureInput(command) {
    this.frame.command = JSON.parse(JSON.stringify(command));
  }

  captureKeyframe(components) {
    this.frame.components = JSON.parse(JSON.stringify(components));
  }

  captureEval(evals) {
    this.frame.eval = evals.map(([code, params, input]) => [code, input]);
  }

  frameEnd() {
    this.capturedFrames.push(this.frame);
    this.frame = null;
  }

  preflightStop() {
    const { capturedFrames, frame: leftoverFrame } = this;
    const { length } = capturedFrames;

    if (leftoverFrame) {
      console.error("Preflight stopped mid-frame; this shouldn't happen");
    }

    console.log(`Captured ${length} frames`);
  }
}
