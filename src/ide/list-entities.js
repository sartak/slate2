import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addEntityAction, setActiveEntityAction } from './project/actions';
import { newEntity } from './ecs/entities';
import { selectEntityList, selectActiveEntityId } from './project/selectors';
import './list-entities.less';

export const EntityList = () => {
  const dispatch = useDispatch();
  const entities = useSelector(
    selectEntityList,
    (prev, next) => prev === next || shallowEqual(
      prev.map(({ label }) => label),
      next.map(({ label }) => label),
    ),
  );
  const activeEntityId = useSelector(selectActiveEntityId);

  return (
    <div className="EntityList">
      <ul>
        {entities.map((entity) => {
          const { id, label } = entity;
          return (
            <li
              key={id}
              className={activeEntityId === id ? "active" : null}
              onClick={() => dispatch(setActiveEntityAction(id))}
            >{label}</li>
          );
        })}
      </ul>
      <div className="controls">
        <button onClick={() => dispatch(addEntityAction(newEntity(0, 0)))}>Add Entity</button>
      </div>
    </div>
  );
}
