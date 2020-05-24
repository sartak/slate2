import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addUserDefinedSystemAction, setActiveSystemAction } from './project/actions';
import { newUserDefinedSystem } from './ecs/systems';
import { selectAvailableSystemsList, selectActiveSystemId } from './project/selectors';
import { ObjectList } from './list-objects';

export const SystemList = () => {
  const dispatch = useDispatch();
  const systems = useSelector(
    selectAvailableSystemsList,
    (prev, next) => prev === next || shallowEqual(
      prev.map(({ label }) => label),
      next.map(({ label }) => label),
    ),
  );
  const activeSystemId = useSelector(selectActiveSystemId);

  return (
    <ObjectList
      objects={systems}
      activeId={activeSystemId}
      onSelect={({ id }) => dispatch(setActiveSystemAction(id))}
      onAdd={() => dispatch(addUserDefinedSystemAction(newUserDefinedSystem()))}
      addLabel="Add System"
      activeHint="= $s"
    />
  );
}
