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

    const assembler = evaluateGameForPreflight(project);
    const assembly = this.assembly = assembler(renderer);
    assembly.init();

    this.isDirty = false;
  }

  setRenderer(renderer) {
    this.renderer = renderer;
    this.isDirty = true;
  }

  runRenderSystems() {
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
}

const PreflightContext = createContext(null);
export { PreflightContext };
