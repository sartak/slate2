import { evaluateGameForPreflight } from '../assemble/preflight';
import Loop from '../../engine/loop';
import InspectorDebugger from './inspector';

export { PreflightContext, PreflightProvider } from './context';

export class Preflight {
  renderer = null;
  project = null;
  assemblyDirty = true;
  assembly = null;
  isRunning = false;
  loop = null;
  inspectorDebugger = new InspectorDebugger();
  debuggers = [this.inspectorDebugger];
  storeUnsubscribe = null;

  constructor(projectStore) {
    this.project = projectStore.getState();

    this.storeUnsubscribe = projectStore.subscribe(() => {
      const { project: prevProject } = this;
      const project = projectStore.getState();
      this.project = project;
      this.didUpdateProject(prevProject, project);
    });
  }

  didUpdateProject(prev, next) {
    this.debuggers.forEach((debug) => debug.didUpdateProject && debug.didUpdateProject(prev, next));

    if (next.preflightRunning) {
      if (!this.isRunning) {
        this._start();
      }

      return;
    }

    if (!next.preflightRunning) {
      if (this.isRunning) {
        this._stop();
        return;
      }
    }

    // @Performance: directly update changed entity-component fields
    if (prev?.entities !== next?.entities) {
      this.assemblyDirty = true;
    }
  }

  regenerateAssembly() {
    const { project, renderer, isRunning } = this;
    if (!renderer || isRunning) {
      return;
    }

    const [assembler, context] = evaluateGameForPreflight({
      ...project,
      debuggers: this.debuggers.map((d) => [d.constructor, 'unused import path']),
    });
    const assembly = this.assembly = assembler(renderer, this.debuggers);

    this.debuggers.forEach((debug) => debug.didUpdateAssembly && debug.didUpdateAssembly(project, assembly, context));

    assembly.init();

    this.assemblyDirty = false;
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
    const render = this.assembly?.render;
    if (render) {
      render(0, 0);
    }
  }

  _start() {
    if (this.assemblyDirty) {
      this.regenerateAssembly();
    }

    this.isRunning = true;
    this.assemblyDirty = true;
    this.loop = new Loop(this.assembly.step);
    this.loop.run();
  }

  _stop() {
    this.isRunning = false;
    this.loop.pause();

    // @Feature: make this optional, for inspecting the end state
    this.runRenderSystems();
  }

  entityComponentValuesForInspector(...args) {
    return this.inspectorDebugger.entityComponentValuesForInspector(...args);
  }

  inspectorEntityComponentUpdate(...args) {
    return this.inspectorDebugger.inspectorEntityComponentUpdate(...args);
  }

  attachInspector(inspector) {
    this.debuggers.forEach((debug) => debug.attachInspector && debug.attachInspector(inspector));
  }

  detachInspector(inspector) {
    this.debuggers.forEach((debug) => debug.detachInspector && debug.detachInspector(inspector));
  }
}

if (module.hot) {
  Preflight.prototype._hotReplace = function (next) {
    this.storeUnsubscribe();
    this._hotReplaceContext(next);
  };
}
