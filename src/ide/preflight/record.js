export default class RecordDebugger {
  label = "record";

  preflightStart(assembly) {
    this.recording = {
      frames: [],
      assemblyCode: assembly.code,
    };
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
    this.recording.frames.push(this.frame);
    this.frame = null;
  }

  preflightStop() {
    const { recording, frame: leftoverFrame } = this;
    const { frames } = recording;
    const { length } = frames;

    if (leftoverFrame) {
      console.error("Preflight stopped mid-frame; this shouldn't happen");
    }

    console.log(`Captured ${length} frames`);
  }
}
