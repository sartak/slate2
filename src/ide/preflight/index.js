import { createContext } from 'react';

export class Preflight {
  renderer = null;
  project = null;
  isDirty = true;

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
    this.isDirty = true;
  }

  regeneratePreflight() {
    const { renderer } = this;
    if (!renderer) {
      return;
    }

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
  }
}

const PreflightContext = createContext(null);
export { PreflightContext };
