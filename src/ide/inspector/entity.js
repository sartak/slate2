import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { changeEntityComponentValueAction, addComponentToEntityAction } from '../project';
import { Components, ComponentByName } from '../project/ecs';
import { PreflightContext } from '../preflight';
import { selectEnabledComponents, makeSelectComponentWithId, makeSelectEntityComponent, selectPreflightRunning } from '../project/selectors';

const FieldComponent = {
  'float': (value, onChange, _, defaultValue) => (
    <input
      type="number"
      value={value}
      placeholder={defaultValue}
      onChange={onChange}
      onBlur={(e) => {
        if (e.target.value === "") {
          e.target.value = defaultValue;
          onChange(e);
        }
      }}
    />
  ),
  'color': (value, onChange) => (
    <input type="color" value={value} onChange={onChange} />
  ),
  'entity': (value) => (
    <span>{value === null ? "(null)" : value}</span>
  ),
};

const InspectEntityComponent = ({ entityIndex, componentId }) => {
  const dispatch = useDispatch();

  const preflight = useContext(PreflightContext);
  const component = useSelector(makeSelectComponentWithId(componentId));

  const entityComponent = useSelector(makeSelectEntityComponent(entityIndex, componentId));

  const preflightRunning = useSelector(selectPreflightRunning);

  const entityValues = preflightRunning ? preflight.entityComponentValuesForInspector(entityIndex, component) : entityComponent.values;

  return (
    <div className="InspectEntityComponent" data-component-id={component.id}>
      <div className="componentLabel">{component.label}</div>
      <ul>
        {component.fields.map((field) => {
          const { id: fieldId, label: fieldLabel, type, defaultValue } = field;

          const onChange = (e) => {
            const value = e.target.value;
            if (preflightRunning) {
              preflight.inspectorEntityComponentUpdate(entityIndex, component, fieldId, value);
            } else {
              dispatch(changeEntityComponentValueAction(entityIndex, component.id, fieldId, value));
            }
          };

          const value = entityValues[fieldId];

          return (
            <li key={fieldId} className="field" data-field-id={fieldId}>
              <span className="label">{fieldLabel ?? fieldId}</span>
              {FieldComponent[type](value, onChange, fieldId, defaultValue)}
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
    project => project.entities[entityIndex],
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
