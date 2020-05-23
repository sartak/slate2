import { selectActiveEntityId } from '../project/selectors';

export default class EvalDebugger {
  project = null;
  assembly = null;
  preflightRunning = false;

  eval(code) {
    const { project, assembly, preflightRunning } = this;

    const params = {};

    if (preflightRunning) {
      assembly.scheduleEval(code, params);
    } else {
      assembly.immediateEval(code, params);
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
