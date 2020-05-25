import { evaluateGameForPreflight } from '../assemble/preflight';
import Loop from '../../engine/loop';
import LiveEntityValuesDebugger from './live-entity-values';
import EvalDebugger from './eval';

export { usePreflight, PreflightProvider } from './context';

export class Preflight {
  renderer = null;
  project = null;
  assemblyDirty = true;
  assembly = null;
  isRunning = false;
  loop = null;
  liveEntityValuesDebugger = new LiveEntityValuesDebugger();
  evalDebugger = new EvalDebugger();
  debuggers = [this.liveEntityValuesDebugger, this.evalDebugger];
  storeUnsubscribe = null;

  constructor(projectStore) {
    this.initialize(projectStore);
  }

  initialize(projectStore) {
    this.project = projectStore.getState();

    this.storeUnsubscribe = projectStore.subscribe(() => {
      const { project: prevProject } = this;
      const project = projectStore.getState();
      this.project = project;
      this.didUpdateProject(prevProject, project);
    });

    this.didUpdateProject(null, this.project);

    const dispatch = (action) => projectStore.dispatch(action);
    this.debuggers.forEach((debug) => debug.registerDispatch && debug.registerDispatch(dispatch));
  }

  didUpdateProject(prev, next) {
    this.debuggers.forEach((debug) => debug.didUpdateProject && debug.didUpdateProject(prev, next));

    if (next?.preflightRunning) {
      if (!this.isRunning) {
        this._start();
      }

      return;
    }

    if (!next?.preflightRunning) {
      if (this.isRunning) {
        this._stop();
        return;
      }
    }

    if (prev !== next) {
      this.assemblyDirty = true;
      this.runRenderSystems();
    }
  }

  regenerateAssembly() {
    const { project, renderer, isRunning, debuggers } = this;

    if (isRunning) {
      return;
    }

    try {
      if (!this.assembly?.didDeinitDesign && this.assembly?.deinitDesign) {
        this.assembly.didDeinitDesign = true;
        this.assembly.deinitDesign();
      }

      this.assembly = null;

      if (!renderer) {
        return;
      }

      const [assembler, context, code] = evaluateGameForPreflight({
        ...project,
        debuggers,
      });

      this.latestCode = code;

      if (!assembler) {
        return;
      }

      const assembly = assembler(renderer, debuggers);
      assembly.context = context;
      assembly.code = code;

      assembly.initDesign();

      // Test a render to make sure we don't crash the whole UI if it breaks.
      if (assembly.renderDesign) {
        assembly.renderDesign(0, 0);
      }

      debuggers.forEach((debug) => debug.didUpdateAssembly && debug.didUpdateAssembly(project, assembly));

      this.assembly = assembly;
      this.assemblyDirty = false;
    } catch (e) {
      console.error(e);
    }
  }

  setRenderer(renderer) {
    this.renderer = renderer;
    this.assemblyDirty = true;
  }

  runRenderSystems() {
    if (this.isRunning) {
      console.warn("runRenderSystems called while running");
      return;
    }

    if (this.assemblyDirty) {
      this.regenerateAssembly();
    }

    const renderDesign = this.assembly?.renderDesign;
    if (renderDesign) {
      renderDesign(0, 0);
    }
  }

  _start() {
    if (this.assembly) {
      this.assembly.deinitDesign?.();
      this.assembly.didDeinitDesign = true;
    }

    if (this.assemblyDirty) {
      this.regenerateAssembly();
    }

    this.isRunning = true;
    this.assemblyDirty = true;

    this.debuggers.forEach((debug) => debug.preflightStart && debug.preflightStart());

    this.assembly.initPreflight();
    this.renderer.focus();
    this.loop = new Loop(this.assembly.step);
    this.loop.run();
  }

  _stop() {
    this.isRunning = false;
    this.loop.pause();
    this.assembly.deinitPreflight();

    this.debuggers.forEach((debug) => debug.preflightStop && debug.preflightStop());

    // @Feature: make this optional, for inspecting the end state
    this.runRenderSystems();
  }

  subscribeToLiveEntityValue(...args) {
    return this.liveEntityValuesDebugger.subscribeValue(...args);
  }

  subscribeToLiveEntityValues(...args) {
    return this.liveEntityValuesDebugger.subscribeComponents(...args);
  }

  changeEntityComponentValue(...args) {
    this.debuggers.forEach((debug) => debug.changeEntityComponentValue && debug.changeEntityComponentValue(...args));
  }

  eval(code) {
    this.evalDebugger.eval(code);
  }

  hitTest(...args) {
    const { assembly } = this;
    const { entityReverseMap } = assembly.context;

    const ret = this.assembly.hitTest(...args);
    if (ret && typeof ret === 'object') {
      return ret.map((entity) => entityReverseMap[entity]);
    } else {
      return entityReverseMap[ret];
    }
  }
}

if (module.hot) {
  let preflights = [];

  const oldInitialize = Preflight.prototype.initialize;
  Preflight.prototype.initialize = function (...args) {
    preflights.push(this);
    oldInitialize.apply(this, args);
  };

  Preflight.prototype._hotReplace = function (next) {
    this.storeUnsubscribe();
    this._hotReplaceContext(next);
    preflights.forEach((preflight) => {
      preflight.renderer?.setPreflight(next);
    });
    preflights = preflights.filter((p) => p !== this);
  };

  module.hot.accept('../assemble/preflight', () => {
    preflights.forEach((preflight) => {
      preflight.assemblyDirty = true;
      preflight.regenerateAssembly();
    });
  });
}
