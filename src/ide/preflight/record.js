export default class RecordDebugger {
  label = "record";

  prepareAssembly(map, project, ctx) {
    const { varName } = map;
    ctx.assembleCaptureFn = (label, expression) => {
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
    const { length } = frames;

    if (leftoverFrame) {
      console.error("Preflight stopped mid-frame; this shouldn't happen");
    }

    console.log(`Captured ${length} frames`);
  }
}
