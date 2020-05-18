import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { changeEntityComponentValueAction, addComponentToEntityAction } from '../project/actions';
import { PreflightContext } from '../preflight';
import { selectEnabledComponents, makeSelectComponentWithId, makeSelectEntityComponent, selectPreflightRunning, makeSelectEntityByIndex } from '../project/selectors';
import { editorForType } from '../types';

const InspectEntityComponent = ({ entityIndex, componentId }) => {
  const dispatch = useDispatch();

  const preflight = useContext(PreflightContext);
  const component = useSelector(makeSelectComponentWithId(componentId));
  const { fields, label: componentLabel } = component;

  const entityComponent = useSelector(makeSelectEntityComponent(entityIndex, componentId));

  const preflightRunning = useSelector(selectPreflightRunning);

  const entityValues = preflightRunning ? preflight.entityComponentValuesForInspector(entityIndex, component) : entityComponent.values;

  return (
    <div className="InspectEntityComponent" data-component-id={componentId}>
      <div className="componentLabel">{componentLabel}</div>
      <ul>
        {fields.map((field) => {
          const { id: fieldId, label: fieldLabel, type, defaultValue } = field;

          const onChange = (value, input) => {
            if (preflightRunning) {
              preflight.inspectorEntityComponentUpdate(entityIndex, component, field, input, value);
            } else {
              dispatch(changeEntityComponentValueAction(entityIndex, componentId, fieldId, value));
            }
          };

          const value = entityValues[fieldId];
          const Editor = editorForType(type);

          return (
            <li key={fieldId} className="field" data-field-id={fieldId}>
              <span className="label">{fieldLabel ?? fieldId}</span>
              <Editor value={value} defaultValue={defaultValue} onChange={onChange} />
            </li>
          );
        })}
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
