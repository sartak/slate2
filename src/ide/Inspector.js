import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { changeEntityComponentValueAction, addComponentToEntityAction } from './project';
import { Components, ComponentByName, newEntityComponent } from './project/ecs';
import { PreflightContext } from './preflight';
import './Inspector.less';

const FieldComponent = {
  'float': (value, onChange, _, defaultValue, preflightRunning) => (
    <input
      type="number"
      value={value}
      placeholder={defaultValue}
      disabled={preflightRunning}
      onChange={onChange}
      onBlur={(e) => {
        if (e.target.value === "") {
          e.target.value = defaultValue;
          onChange(e);
        }
      }}
    />
  ),
  'color': (value, onChange, _, _2, preflightRunning) => (
    <input type="color" value={value} onChange={onChange} disabled={preflightRunning} />
  ),
  'entity': (value) => (
    <span>{value === null ? "(null)" : value}</span>
  ),
};

const InspectEntityComponent = ({ entityIndex, componentName }) => {
  const dispatch = useDispatch();

  const preflight = useContext(PreflightContext);
  const component = ComponentByName[componentName];
  const entityComponent = useSelector(
    project => {
      const entity = project.entities[entityIndex];
      return entity.components.find((c) => c.name === componentName);
    },
    (prev, next) => shallowEqual(prev, next),
  );

  const preflightRunning = useSelector(project => project.preflightRunning);

  const entityValues = preflightRunning ? preflight.entityComponentValuesForInspector(entityIndex, component.name) : entityComponent.fields;

  return (
    <div className="InspectEntityComponent">
      <div className="componentName">{component.name}</div>
      <ul>
        {component.fields.map((field) => {
          const { name: fieldName, type, default: defaultValue } = field;

          const onChange = (e) => {
            if (preflightRunning) {
              return;
            }

            const value = e.target.value;
            dispatch(changeEntityComponentValueAction(entityIndex, componentName, fieldName, value));
          };

          const value = entityValues[fieldName];

          return (
            <li key={fieldName}>
              <span className="name">{fieldName}</span>
              {FieldComponent[type](value, onChange, fieldName, defaultValue, preflightRunning)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const AddComponentToEntity = ({ entityIndex, entity }) => {
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
    dispatch(addComponentToEntityAction(entityIndex, newEntityComponent(component)));
    setAdding(false);
  };


  const hasComponent = {};
  entity.components.forEach((entityComponent) => {
    hasComponent[entityComponent.name] = true;
  });

  const possibleComponents = Components.filter((component) => !hasComponent[component.name]);

  return (
    <ul>
      {possibleComponents.map((component) => {
        return (
          <li key={component.name}>
            <a href="#" onClick={() => addComponent(component)}>{component.name}</a>
          </li>
        );
      })}
    </ul>
  );
};

const InspectEntity = ({ entityIndex }) => {
  const entity = useSelector(
    project => project.entities[entityIndex],
    (prev, next) => prev === next || shallowEqual(
      prev.components.map(({ name }) => name),
      next.components.map(({ name }) => name),
    )
  );

  return (
    <div className="InspectEntity">
      <ul className="components">
        {entity.components.map(({ name }) => (
          <li key={name}>
            <InspectEntityComponent
              entityIndex={entityIndex}
              componentName={name}
            />
          </li>
        ))}
      </ul>
      <div className="controls">
        <AddComponentToEntity
          entityIndex={entityIndex}
          entity={entity}
        />
      </div>
    </div>
  );
};

export const Inspector = () => {
  const entityIndex = useSelector(project => project.selectedEntityIndex);
  const dispatch = useDispatch();

  return (
    <div className="Inspector">
      {entityIndex !== -1 && <InspectEntity entityIndex={entityIndex} />}
    </div>
  );
}
