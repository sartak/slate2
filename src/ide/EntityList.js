import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEntityAction } from './project';
import './EntityList.less';

export const EntityList = () => {
  const dispatch = useDispatch();
  const entities = useSelector(project => project.entities);

  return (
    <div className="EntityList">
      <ul>
        {entities.map((entity) => {
          return (
            <li key={entity.__id}>{JSON.stringify(entity)}</li>
          );
        })}
      </ul>
      <div className="controls">
        <button onClick={() => dispatch(addEntityAction({}))}>Add Entity</button>
      </div>
    </div>
  );
}
