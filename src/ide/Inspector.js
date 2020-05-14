import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeEntityComponentValueAction, addComponentToEntityAction } from './project';
import { Components, ComponentByName, newEntityComponent } from './project/components';
import './Inspector.less';

const FieldComponent = {
  'float': (value, onChange) => (
    <input type="number" value={value} onChange={onChange} />
  ),
  'color': (value, onChange) => (
    <input type="color" value={value} onChange={onChange} />
  ),
  'entity': (value) => (
    <span>{value === null ? "(null)" : value}</span>
  ),
};

const InspectEntityComponent = ({ entityIndex, entity, config, dispatch }) => {
  const { name: componentName, fields: entityValues } = config;

  const [component, label] = ComponentByName[componentName];

  return (
    <div className="InspectEntityComponent">
      <div className="componentName">{label}</div>
      <ul>
        {component.fields.map((field) => {
          const { name: fieldName, type } = field;

          const onChange = (e) => {
            const value = e.target.value;
            dispatch(changeEntityComponentValueAction(entityIndex, componentName, fieldName, value));
          };

          const value = entityValues[fieldName];

          return (
            <li key={fieldName}>
              <span className="name">{fieldName}</span>
              {FieldComponent[type](value, onChange, fieldName)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const AddComponentToEntity = ({ entityIndex, entity, dispatch }) => {
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

  const possibleComponents = Components.filter(([component]) => !hasComponent[component.name]);

  return (
    <ul>
      {possibleComponents.map(([component, label]) => {
        return (
          <li key={component.name}>
            <a href="javascript:void(0)" onClick={() => addComponent(component)}>{label}</a>
          </li>
        );
      })}
    </ul>
  );
};

const InspectEntity = ({ entityIndex, dispatch }) => {
  const entity = useSelector(project => project.entities[entityIndex]);

  return (
    <div className="InspectEntity">
      <ul className="components">
        {entity.components.map((config, c) => (
          <li key={c}>
            <InspectEntityComponent
              entityIndex={entityIndex}
              entity={entity}
              config={config}
              dispatch={dispatch}
            />
          </li>
        ))}
      </ul>
      <div className="controls">
        <AddComponentToEntity
          entityIndex={entityIndex}
          entity={entity}
          dispatch={dispatch}
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
      {entityIndex !== -1 && <InspectEntity entityIndex={entityIndex} dispatch={dispatch} />}
    </div>
  );
}
