import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addEntityAction, setActiveEntityAction } from './project/actions';
import { newEntity } from './ecs/entities';
import { selectEntityList, selectActiveEntityId } from './project/selectors';
import { ObjectList } from './list-objects';

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
    <ObjectList
      objects={entities}
      activeId={activeEntityId}
      onSelect={({ id }) => dispatch(setActiveEntityAction(id))}
      onAdd={() => dispatch(addEntityAction(newEntity(0, 0)))}
      addLabel="Add Entity"
    />
  );
}
