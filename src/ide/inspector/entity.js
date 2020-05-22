import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addComponentToEntityAction, setEntityLabelAction } from '../project/actions';
import { selectEnabledComponents, makeSelectComponentWithId, makeSelectEntity } from '../project/selectors';
import { editorForType } from '../types';
import { useLiveEntityComponentValue } from '../preflight/useLiveEntityComponentValue';
import { TextControlled } from '../field/text-controlled';

const InspectEntityComponentValue = ({ entityId, component, field }) => {
  const fieldRef = useRef(null);

  const { id: componentId } = component;
  const { id: fieldId, label: fieldLabel, type, defaultValue } = field;

  const setComponentValue = useLiveEntityComponentValue((mode, value) => {
    fieldRef.current?.setValueUnlessFocused(value);
  }, entityId, componentId, fieldId);

  const Editor = editorForType(type);

  return (
    <li className="field">
      <span className="label">{fieldLabel ?? fieldId}</span>
      <Editor
        ref={fieldRef}
        defaultValue={defaultValue}
        onChange={setComponentValue}
      />
    </li>
  );
};

const InspectEntityComponent = ({ entityId, componentId }) => {
  const component = useSelector(makeSelectComponentWithId(componentId));
  const { fields, label: componentLabel } = component;

  return (
    <div className="InspectEntityComponent">
      <div className="componentLabel">{componentLabel}</div>
      <ul>
        {fields.map((field) => (
          <InspectEntityComponentValue
            key={field.id}
            entityId={entityId}
            component={component}
            field={field}
          />
        ))}
      </ul>
    </div>
  );
};

const AddComponentToEntity = ({ entityId, entity, enabledComponents }) => {
  const dispatch = useDispatch();
  const [isAdding, setAdding] = useState(false);

  useEffect(() => {
    setAdding(false);
  }, [entityId]);

  if (!isAdding) {
    return (
      <button onClick={() => setAdding(true)}>Add Component</button>
    );
  }

  const addComponent = (component) => {
    dispatch(addComponentToEntityAction(entityId, component.makeEntityComponent()));
    setAdding(false);
  };

  return (
    <ul>
      {enabledComponents.map((component) => {
        if (entity.componentConfig[component.id]) {
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

export const InspectEntityLabel = ({ entityId }) => {
  const dispatch = useDispatch();
  const entity = useSelector(
    makeSelectEntity(entityId),
    (prev, next) => prev.label === next.label,
  );

  const { label, id: defaultValue } = entity;
  const setLabel = (label) => dispatch(setEntityLabelAction(entityId, label));

  return (
    <div className="InspectEntityLabel">
      <TextControlled
        value={label}
        defaultValue={defaultValue}
        onChange={setLabel}
      />
    </div>
  );
};

export const InspectEntity = ({ entityId }) => {
  const entity = useSelector(
    makeSelectEntity(entityId),
    (prev, next) => shallowEqual(
      Object.keys(prev.componentConfig),
      Object.keys(next.componentConfig),
    ),
  );

  const enabledComponents = useSelector(selectEnabledComponents);

  return (
    <div className="InspectEntity">
      <InspectEntityLabel entityId={entityId} />
      <ul className="components">
        {entity.componentIds.map((id) => (
          <li key={id}>
            <InspectEntityComponent
              entityId={entityId}
              componentId={id}
            />
          </li>
        ))}
      </ul>
      <div className="controls">
        <AddComponentToEntity
          entityId={entityId}
          entity={entity}
          enabledComponents={enabledComponents}
        />
      </div>
    </div>
  );
};
