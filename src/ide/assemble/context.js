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

    forPreflight: false,

    imports: [],

    timeUpdateVar: 'timeUpdate',
    dtUpdateAmount: 1000 / 60,
    lagUpdateVar: 'lagUpdate',

    dtStepVar: 'dt',
    timeStepVar: 'time',

    cloneEntityFn: `${prefix}cloneEntity`,
    destroyEntityFn: `${prefix}destroyEntity`,

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
    entityIndexLookupVar: `${prefix}entityIndexLookup`,
    entityMap: {},
    entityReverseMap: {},
    entityObjects: [],

    componentsVar: `${prefix}allComponents`,
    componentMap: {},
    componentObjects: [],

    systemsVar: `${prefix}allSystems`,
    systemMap: {},
    systemObjects: [],
    systemClassPrefix: prefix,

    attachListenerFn: `${prefix}attachListener`,
    commandPressedFn: `command`,
    commandKeysVar: `${prefix}commandKeys`,
    commandFrameVar: `${prefix}commandFrame`,

    ...overrides,
  };
};
