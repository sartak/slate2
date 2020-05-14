import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeEntityComponentValueAction } from './project';
import { Components, ComponentByName } from './project/components';
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

const InspectEntityComponent = ({ index, entity, config, dispatch }) => {
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
            dispatch(changeEntityComponentValueAction(index, componentName, fieldName, value));
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

const InspectEntity = ({ index, dispatch }) => {
  const entity = useSelector(project => project.entities[index]);
  const [isAddingComponent, setAddingComponent] = useState(false);

  useEffect(() => {
    setAddingComponent(false);
  }, [index]);

  return (
    <div className="InspectEntity">
      <ul className="components">
        {entity.components.map((config, c) => (
          <li key={c}>
            <InspectEntityComponent
              index={index}
              entity={entity}
              config={config}
              dispatch={dispatch}
            />
          </li>
        ))}
      </ul>
      <div className="controls">
        {isAddingComponent ? (
          <ul>
            {Components.map(([, label], c) => {
              return <li key={c}>{label}</li>
            })}
          </ul>
        ) : (
          <button onClick={() => setAddingComponent(true)}>Add Component</button>
        )}
      </div>
    </div>
  );
};

export const Inspector = () => {
  const index = useSelector(project => project.selectedEntityIndex);
  const dispatch = useDispatch();

  return (
    <div className="Inspector">
      {index !== -1 && <InspectEntity index={index} dispatch={dispatch} />}
    </div>
  );
}
