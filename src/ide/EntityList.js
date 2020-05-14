import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEntityAction, selectEntityIndexAction, newEntity } from './project';
import './EntityList.less';

export const EntityList = () => {
  const dispatch = useDispatch();
  const entities = useSelector(project => project.entities);
  const selectedEntityIndex = useSelector(project => project.selectedEntityIndex);

  return (
    <div className="EntityList">
      <ul>
        {entities.map((entity, i) => {
          return (
            <li
              key={entity.__id}
              className={selectedEntityIndex === i ? "active" : null}
              onClick={() => dispatch(selectEntityIndexAction(i))}
            >Entity {entity.__id}</li>
          );
        })}
      </ul>
      <div className="controls">
        <button onClick={() => dispatch(addEntityAction(newEntity(0, 0)))}>Add Entity</button>
      </div>
    </div>
  );
}
