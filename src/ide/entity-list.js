import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addEntityAction, selectEntityIndexAction } from './project/actions';
import { newEntity } from './ecs/entities';
import { selectEntities, selectSelectedEntityIndex } from './project/selectors';
import './entity-list.less';

export const EntityList = () => {
  const dispatch = useDispatch();
  const entities = useSelector(
    selectEntities,
    (prev, next) => prev === next || shallowEqual(
      prev.map(({ id }) => id),
      next.map(({ id }) => id),
    ),
  );
  const selectedEntityIndex = useSelector(selectSelectedEntityIndex);

  return (
    <div className="EntityList">
      <ul>
        {entities.map((entity, i) => {
          return (
            <li
              key={entity.id}
              className={selectedEntityIndex === i ? "active" : null}
              onClick={() => dispatch(selectEntityIndexAction(i))}
            >Entity {entity.id}</li>
          );
        })}
      </ul>
      <div className="controls">
        <button onClick={() => dispatch(addEntityAction(newEntity(0, 0)))}>Add Entity</button>
      </div>
    </div>
  );
}
