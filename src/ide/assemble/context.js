import { selectRenderer } from '../project/selectors';

export const newContext = (project, overrides = {}) => {
  const prefix = 'prefix' in overrides ? overrides.prefix : '__';

  const renderVarsForRenderer = {
    'canvas': [`${prefix}ctx`],
    'webgl': [`${prefix}ctx`],
    'webgpu': [`${prefix}ctx`],
  };

  const renderer = selectRenderer(project);
  const renderVars = renderVarsForRenderer[renderer];

  return {
    prefix,

    designMode: false,

    imports: [],

    init: [],
    input: [],
    update: [],
    render: [],
    cleanup: [],
    deinit: [],
    preparedLoop: false,

    gameClass: `${prefix}Game`,
    loopClass: `${prefix}Loop`,

    renderer,
    rendererClass: `${prefix}Renderer`,
    rendererVar: `${prefix}renderer`,
    renderVars,
    preparedRenderer: false,

    debuggersVar: `${prefix}allDebuggers`,
    debuggerVars: [],
    debuggers: [],
    debuggerMap: {},
    debuggerClassPrefix: prefix,

    entitiesVar: `${prefix}allEntities`,
    entityMap: {},
    entityObjects: [],

    componentsVar: `${prefix}allComponents`,
    componentMap: {},
    componentObjects: [],

    systemsVar: `${prefix}allSystems`,
    systemMap: {},
    systemObjects: [],
    systemClassPrefix: prefix,

    ...overrides,
  };
};
