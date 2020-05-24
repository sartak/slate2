import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSelectorLazy } from '../project/useSelectorLazy';
import { setUserDefinedSystemLabelAction, setCodeForUserDefinedSystemMethodAction, addRequiredComponentToUserDefinedSystemAction } from '../project/actions';
import { makeSelectSystem, selectEnabledComponents, selectProject } from '../project/selectors';
import { lookupComponentWithId  } from '../ecs/components';
import { TextControlled } from '../field/text-controlled';
import { useFloatingEditor } from '../code-editor';

// @Cleanup: find a more canonical location for this list.
const SystemMethods = [
  ['init', []],
  ['input', []],
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

    openEditor(code, options);
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
          <button onClick={edit}>View Code</button>
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
            <li key={componentId}>{component.label}</li>
          );
        })}
      </ul>
      {userDefined && <AddRequiredComponentToSystem id={id} />}
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
        defaultValue={`System${id}`}
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
        <li><InspectSystemComponents id={id} /></li>
        <li><InspectSystemMethods id={id} /></li>
      </ul>
    </div>
  );
};
