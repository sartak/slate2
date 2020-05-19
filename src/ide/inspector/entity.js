import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addComponentToEntityAction } from '../project/actions';
import { selectEnabledComponents, makeSelectComponentWithId, makeSelectEntityByIndex } from '../project/selectors';
import { editorForType } from '../types';
import { useLiveEntityComponentValue } from '../preflight/useLiveEntityComponentValue';

const InspectEntityComponentValue = ({ entityIndex, component, field }) => {
  const fieldRef = useRef(null);

  const { id: componentId } = component;
  const { id: fieldId, label: fieldLabel, type, defaultValue } = field;

  const setComponentValue = useLiveEntityComponentValue((mode, value) => {
    fieldRef.current?.setValueUnlessFocused(value);
  }, entityIndex, componentId, fieldId);

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

const InspectEntityComponent = ({ entityIndex, componentId }) => {
  const component = useSelector(makeSelectComponentWithId(componentId));
  const { fields, label: componentLabel } = component;

  return (
    <div className="InspectEntityComponent">
      <div className="componentLabel">{componentLabel}</div>
      <ul>
        {fields.map((field) => (
          <InspectEntityComponentValue
            key={field.id}
            entityIndex={entityIndex}
            component={component}
            field={field}
          />
        ))}
      </ul>
    </div>
  );
};

const AddComponentToEntity = ({ entityIndex, entity, enabledComponents }) => {
  const dispatch = useDispatch();
  const [isAdding, setAdding] = useState(false);

  useEffect(() => {
    setAdding(false);
  }, [entityIndex]);

  if (!isAdding) {
    return (
      <button onClick={() => setAdding(true)}>Add Component</button>
    );
  }

  const addComponent = (component) => {
    dispatch(addComponentToEntityAction(entityIndex, component.makeEntityComponent()));
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

export const InspectEntity = ({ entityIndex }) => {
  const entity = useSelector(
    makeSelectEntityByIndex(entityIndex),
    (prev, next) => shallowEqual(
      Object.keys(prev.componentConfig),
      Object.keys(next.componentConfig),
    ),
  );

  const enabledComponents = useSelector(selectEnabledComponents);

  return (
    <div className="InspectEntity">
      <ul className="components">
        {entity.componentIds.map((id) => (
          <li key={id}>
            <InspectEntityComponent
              entityIndex={entityIndex}
              componentId={id}
            />
          </li>
        ))}
      </ul>
      <div className="controls">
        <AddComponentToEntity
          entityIndex={entityIndex}
          entity={entity}
          enabledComponents={enabledComponents}
        />
      </div>
    </div>
  );
};
