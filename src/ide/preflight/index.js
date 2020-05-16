import { createContext } from 'react';
import { evaluateGameForPreflight } from '../assemble/preflight';
import Loop from '../../engine/loop';

export class Preflight {
  renderer = null;
  project = null;
  isDirty = true;
  assembly = null;
  isRunning = false;
  loop = null;
  debuggers = [];

  constructor(projectStore) {
    this.project = projectStore.getState();

    projectStore.subscribe(() => {
      const { project: prevProject } = this;
      const project = projectStore.getState();
      this.project = project;
      this.didUpdateProject(prevProject, project);
    });
  }

  didUpdateProject(prev, next) {
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
      this.isDirty = true;
    }
  }

  regeneratePreflight() {
    const { project, renderer, isRunning } = this;
    if (!renderer || isRunning) {
      return;
    }

    const assembler = evaluateGameForPreflight({
      ...project,
      debuggers: this.debuggers.map((d) => [d.constructor, 'unused import path']),
    });
    const assembly = this.assembly = assembler(renderer, this.debuggers);
    assembly.init();

    this.isDirty = false;
  }

  setRenderer(renderer) {
    this.renderer = renderer;
    this.isDirty = true;
  }

  runRenderSystems() {
    if (this.isRunning) {
      console.warn("runRenderSystems called while running");
      return;
    }

    if (this.isDirty) {
      this.regeneratePreflight();
    }
    const render = this.assembly?.render;
    if (render) {
      render(0, 0);
    }
  }

  _start() {
    if (this.isDirty) {
      this.regeneratePreflight();
    }

    this.isRunning = true;
    this.isDirty = true;
    this.loop = new Loop(this.assembly.step);
    this.loop.run();
  }

  _stop() {
    this.isRunning = false;
    this.loop.pause();

    // @Feature: make this optional, for inspecting the end state
    this.runRenderSystems();
  }
}

const PreflightContext = createContext(null);
export { PreflightContext };
