import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Components, ComponentByName } from './project/components';
import './Inspector.less';

const InspectEntityComponent = ({ index, entity, config }) => {
  const { name: componentName, fields } = config;

  const [component, label] = ComponentByName[componentName];

  return (
    <div className="InspectEntityComponent">
      <div className="componentName">{label}</div>
      <ul>
        {component.fields.map((field) => {
          const { name: fieldName, value } = field;

          return (
            <li key={fieldName}>
              <span className="name">{fieldName}</span>
              {value}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const InspectEntity = ({ index }) => {
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

  return (
    <div className="Inspector">
      {index !== -1 && <InspectEntity index={index} />}
    </div>
  );
}
