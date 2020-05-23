export default class EvalDebugger {
  project = null;
  assembly = null;
  preflightRunning = false;

  eval(code) {
    if (this.preflightRunning) {
      this.assembly.scheduleEval(code);
    } else {
      this.assembly.immediateEval(code);
    }
  }

  didUpdateProject(prev, next) {
    this.project = next;
  }

  didUpdateAssembly(project, assembly) {
    this.assembly = assembly;
  }

  preflightStart() {
    this.preflightRunning = true;
  }

  preflightStop() {
    this.preflightRunning = false;
  }
}
