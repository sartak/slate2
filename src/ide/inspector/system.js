import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSelectorLazy } from '../project/useSelectorLazy';
import { setUserDefinedSystemLabelAction, setCodeForUserDefinedSystemMethodAction, addRequiredComponentToUserDefinedSystemAction, removeRequiredComponentFromUserDefinedSystemAction, setActiveComponentAction } from '../project/actions';
import { makeSelectSystem, selectEnabledComponents, selectProject } from '../project/selectors';
import { lookupComponentWithId  } from '../ecs/components';
import { TextControlled } from '../field/text-controlled';
import { useFloatingEditor } from '../code-editor';
import { InspectCommands } from './commands';
import { KeyboardInputSystemId } from '../systems/keyboard-input';
import { usePreflight } from '../preflight';

// @Cleanup: find a more canonical location for this list.
const SystemMethods = [
  ['init', ['commandKeys']],
  ['input', ['frame']],
  ['update', ['entities', 'dt', 'time']],
  ['render_canvas', ['ctx', 'entities', 'dt', 'time']],
  ['render_webgl', ['ctx', 'entities', 'dt', 'time']],
  ['render_webgpu', ['ctx', 'entities', 'dt', 'time']],
  ['deinit', []],
];

const InspectSystemMethod = ({ systemId, method, userDefined }) => {
  const dispatch = useDispatch();
  const system = useSelector(makeSelectSystem(systemId));
  const openEditor = useFloatingEditor();
  const preflight = usePreflight();

  const setCode = (code) => {
    dispatch(setCodeForUserDefinedSystemMethodAction(systemId, method, code));
  };

  const edit = () => {
    const options = {
      language: "javascript",
      readOnly: !userDefined,
      onChange: (value) => setCode(value),
    };

    let code;
    if (userDefined) {
      if (system.methods[method]) {
        code = system.methods[method];
      } else {
        const config = SystemMethods.find(([name]) => name === method);
        const params = config[1];
        code = `function ${method} (${params.join(', ')}) {\n  \n}`;
        setCode(code);
      }
    } else {
      code = String(system.__proto__[method]);
    }

    openEditor(code, `${systemId}.${method}`, options);
  };

  const viewGenerated = () => {
    const options = {
      language: "javascript",
      readOnly: true,
    };

    const code = preflight.generatedCodeForSystemMethod(systemId, method);
    openEditor(code, `${systemId}.generated.${method}`, options);
  };

  return (
    <React.Fragment>
      <div className="label">{method}</div>
      <div className="field">
        {userDefined ? (
          system.methods[method] ? (
            <button onClick={edit}>Edit Code</button>
          ) : (
            <button onClick={edit}>Add Method</button>
          )
        ) : (
          <button onClick={edit}>View Source</button>
        )}
        {(!userDefined || system.methods[method]) && (
          <button onClick={viewGenerated}>View Generated</button>
        )}
      </div>
    </React.Fragment>
  );
};

const InspectSystemMethods = ({ id }) => {
  const system = useSelector(makeSelectSystem(id));

  const { userDefined } = system;

  return (
    <div className="InspectSubobject">
      <div className="label">Methods</div>
      <ul>
        { userDefined ? (
          SystemMethods.map(([method]) => (
            <li key={method}>
              <InspectSystemMethod systemId={id} method={method} userDefined={userDefined} />
            </li>
          ))
        ) : (
          SystemMethods.filter(([method]) => system.__proto__[method]).map(([method]) => (
            <li key={method}>
              <InspectSystemMethod systemId={id} method={method} userDefined={userDefined} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

const AddRequiredComponentToSystem = ({ id }) => {
  const dispatch = useDispatch();
  const [isAdding, setAdding] = useState(false);
  const enabledComponentsLazy = useSelectorLazy(selectEnabledComponents);
  const systemLazy = useSelectorLazy(makeSelectSystem(id));

  useEffect(() => {
    setAdding(false);
  }, [id]);

  if (!isAdding) {
    return (
      <button onClick={() => setAdding(true)}>Add Component</button>
    );
  }

  const enabledComponents = enabledComponentsLazy();
  const system = systemLazy();

  const addComponent = (component) => {
    dispatch(addRequiredComponentToUserDefinedSystemAction(id, component.id));
    setAdding(false);
  };

  return (
    <ul>
      {enabledComponents.map((component) => {
        if (system.requiredComponents.find((id) => id === component.id)) {
          return null;
        }

        return (
          <li key={component.id}>
            <button onClick={() => addComponent(component)}>Add {component.label}</button>
          </li>
        );
      })}
    </ul>
  );
};

const InspectSystemComponents = ({ id }) => {
  const dispatch = useDispatch();
  const system = useSelector(makeSelectSystem(id));
  const project = useSelector(selectProject);

  const { userDefined, requiredComponents } = system;

  return (
    <div className="InspectSubobject">
      <div className="label">Required Components</div>
      <ul>
        {requiredComponents.map((componentId) => {
          const component = lookupComponentWithId(project, componentId);
          return (
            <li key={componentId}>
              <span className="label clickable" onClick={() => dispatch(setActiveComponentAction(componentId))}>{component.label}</span>
              {userDefined && (
                <button
                  onClick={() => {
                    dispatch(removeRequiredComponentFromUserDefinedSystemAction(id, componentId));
                  }}
                >
                  Remove
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="controls">
        {userDefined && <AddRequiredComponentToSystem id={id} />}
      </div>
    </div>
  );
};

const InspectUserDefinedSystemLabel = ({ id }) => {
  const dispatch = useDispatch();
  const system = useSelector(
    makeSelectSystem(id),
    (prev, next) => prev.label === next.label,
  );

  const { label } = system;
  const setLabel = (label) => dispatch(setUserDefinedSystemLabelAction(id, label));

  return (
    <div className="InspectLabel">
      <TextControlled
        value={label}
        defaultValue={id}
        onChange={setLabel}
      />
    </div>
  );
};

export const InspectSystem = ({ id }) => {
  const system = useSelector(makeSelectSystem(id));
  const { userDefined } = system;

  return (
    <div className="InspectObject">
      { userDefined ? (
        <InspectUserDefinedSystemLabel id={id} />
      ) : (
        <div className="label">{system.label}</div>
      )}
      <ul>
        {
          id === KeyboardInputSystemId ? (
            <li><InspectCommands /></li>
          ) : (
            <li><InspectSystemComponents id={id} /></li>
          )
        }
        <li><InspectSystemMethods id={id} /></li>
      </ul>
    </div>
  );
};
