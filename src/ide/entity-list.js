import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addEntityAction, setActiveEntityId } from './project/actions';
import { newEntity } from './ecs/entities';
import { selectEntityList, selectActiveEntityId } from './project/selectors';
import './entity-list.less';

export const EntityList = () => {
  const dispatch = useDispatch();
  const entities = useSelector(
    selectEntityList,
    (prev, next) => prev === next || shallowEqual(
      prev.map(({ id }) => id),
      next.map(({ id }) => id),
    ),
  );
  const activeEntityId = useSelector(selectActiveEntityId);

  return (
    <div className="EntityList">
      <ul>
        {entities.map((entity) => {
          const { id } = entity;
          return (
            <li
              key={id}
              className={activeEntityId === id ? "active" : null}
              onClick={() => dispatch(setActiveEntityId(id))}
            >Entity {id}</li>
          );
        })}
      </ul>
      <div className="controls">
        <button onClick={() => dispatch(addEntityAction(newEntity(0, 0)))}>Add Entity</button>
      </div>
    </div>
  );
}
