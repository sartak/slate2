import { createContext } from 'react';

export class Preflight {
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
    this.isDirty = false;
  }

  runRenderSystems() {
    if (this.isDirty) {
      this.regeneratePreflight();
    }
  }
}

const PreflightContext = createContext(null);
export { PreflightContext };
