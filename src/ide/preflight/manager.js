import { evaluateGameForPreflight } from '../assemble/preflight';
import { addRecordingAction, preflightRunningAction } from '../project/actions';
import Loop from '../../engine/loop';
import LiveEntityValuesDebugger from './live-entity-values';
import EvalDebugger from './eval';
import RecordDebugger from './record';
import ReplayDebugger from './replay';

const LoopReplays = true;

export class PreflightManager {
  renderer = null;
  project = null;
  assemblyDirty = true;
  assembly = null;
  isRunning = false;
  replay = null;
  loop = null;
  liveEntityValuesDebugger = new LiveEntityValuesDebugger();
  evalDebugger = new EvalDebugger();
  recordDebugger = new RecordDebugger();
  replayDebugger = new ReplayDebugger();
  debuggers = [this.liveEntityValuesDebugger, this.evalDebugger, this.recordDebugger, this.replayDebugger];
  storeUnsubscribe = null;
  projectStore = null;
  dispatch = null;
  _hotDeferStart = null;

  constructor(projectStore, hotDeferStart) {
    this._hotDeferStart = hotDeferStart;
    this.projectStore = projectStore;
    this.project = projectStore.getState();

    this.storeUnsubscribe = projectStore.subscribe(() => {
      const { project: prevProject } = this;
      const project = projectStore.getState();
      this.project = project;
      this.didUpdateProject(prevProject, project);
    });

    this.didUpdateProject(null, this.project);

    const dispatch = (action) => projectStore.dispatch(action);
    this.dispatch = dispatch;
    this.debuggers.forEach((debug) => debug.registerDispatch && debug.registerDispatch(dispatch));
  }

  didUpdateProject(prev, next) {
    this.debuggers.forEach((debug) => debug.didUpdateProject && debug.didUpdateProject(prev, next));

    if (next?.preflightRunning) {
      if (!this.isRunning) {
        if (this._hotDeferStart) {
          return;
        }
        this._start(next.preflightReplay);
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
    const { project, renderer, isRunning, replay } = this;

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

      const debuggers = this.debuggers.filter((debug) => {
        if (debug === this.replayDebugger && !replay) {
          return false;
        }
        if (debug === this.recordDebugger && replay) {
          return false;
        }
        return true;
      });

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
      assembly.debuggers = debuggers;

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
    if (this.renderer === renderer) {
      return;
    }

    this.renderer = renderer;
    this.renderer.setPreflight(this);
    this.assemblyDirty = true;
  }

  runRenderSystems() {
    if (this.isRunning) {
      console.warn("runRenderSystems called while running");
      return;
    }

    const assembly = this.freshAssembly();
    const renderDesign = assembly?.renderDesign;
    if (renderDesign) {
      renderDesign(0, 0);
    }
  }

  freshAssembly() {
    if (this.assemblyDirty || !this.assembly) {
      this.regenerateAssembly();
    }
    return this.assembly;
  }

  _start(replay = null) {
    this.replay = replay;

    if (replay) {
      this.assemblyDirty = true;

      replay.onEnd = () => {
        if (LoopReplays) {
          this._stop(replay);
          return true;
        } else {
          this.loop.pause();
          this.dispatch(preflightRunningAction(false));
          return false;
        }
      };
    }

    if (this.assembly) {
      this.assembly.deinitDesign?.();
      this.assembly.didDeinitDesign = true;
    }

    const assembly = this.freshAssembly();
    if (!assembly) {
      console.error('Cannot start; assembly is null');
      return;
    }

    this.isRunning = true;
    this.assemblyDirty = true;

    assembly.debuggers.forEach((debug) => debug.preflightStart && debug.preflightStart(assembly, replay));

    assembly.initPreflight();
    this.renderer.focus();
    this.loop = new Loop(assembly.step);
    this.loop.run();
  }

  _stop(loopReplay) {
    const { assembly } = this;

    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.replay = null;
    this.loop.pause();
    assembly.deinitPreflight();

    assembly.debuggers.forEach((debug) => debug.preflightStop && debug.preflightStop());

    const recording = this.recordDebugger.provideRecording();
    if (recording) {
      this.dispatch(addRecordingAction(recording));
    }

    if (this._hotReplaceWhenDoneRunning) {
      setTimeout(() => {
        console.log('PreflightManager now executing deferred hot reload');
        const next = this._hotReplace(this._hotReplaceWhenDoneRunning);
        if (loopReplay) {
          next._start(loopReplay);
        }
      });

      return;
    }

    if (loopReplay) {
      this._start(loopReplay);
      return;
    }

    // @Feature: make this optional, for inspecting the end state
    this.runRenderSystems();
  }

  subscribeToLiveEntityValue(...args) {
    return this.liveEntityValuesDebugger.subscribeValue(...args);
  }

  subscribeToLiveEntityValues(...args) {
    return this.liveEntityValuesDebugger.subscribeComponents(...args);
  }

  subscribeToReplayFrame(...args) {
    return this.replayDebugger.subscribeToFrame(...args);
  }

  beginReplayControl() {
    this.loop.pause();
  }

  endReplayControl() {
    this.loop.run();
  }

  setReplayFrameIndex(...args) {
    this.replayDebugger.setFrameIndex(...args);
    this.assembly.step();
  }

  changeEntityComponentValue(...args) {
    this.debuggers.forEach((debug) => debug.changeEntityComponentValue && debug.changeEntityComponentValue(...args));
  }

  eval(code) {
    this.evalDebugger.eval(code);
  }

  hitTest(x, y, all) {
    const assembly = this.freshAssembly();
    if (!assembly) {
      return all ? [] : null;
    }

    const { entityReverseMap } = assembly.context;

    const ret = this.assembly.hitTest(x, y, all);
    if (all) {
      return ret.map((entity) => entityReverseMap[entity]);
    } else {
      return entityReverseMap[ret];
    }
  }

  generatedCodeForSystemMethod(systemId, method) {
    const assembly = this.freshAssembly();
    if (!assembly) {
      return `/* Sorry, currently unavailable due to compile errors */`;
    }

    const { context } = assembly;
    const map = context.systemMap[systemId];

    if (map) {
      const generator = map.codeGenerators[method];
      if (generator) {
        return generator(context);
      }
    }

    // @Incomplete: If the system is not _currently_ in the assembly (because no entities use
    // all of its required components) then we can't show the generated code for it.
    return `/* No method ${method} found on ${map ? map.system.label : systemId} */`;
  }
}

if (module.hot) {
  PreflightManager.prototype._hotReplace = function (nextClass) {
    if (this.isRunning) {
      this._hotReplaceWhenDoneRunning = nextClass;
      console.log('Note: Suppressing PreflightManager hot reload until after done running');
      return;
    }

    this.storeUnsubscribe();
    const next = new nextClass(this.projectStore, true);
    this.renderer?.setPreflight(next);
    next.regenerateAssembly();
    next._hotDeferStart = false;
    this._hotReplaceContext(next);
    return next;
  };
}
