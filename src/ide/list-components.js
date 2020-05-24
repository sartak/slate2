import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addUserDefinedComponentAction, setActiveComponentAction } from './project/actions';
import { newUserDefinedComponent } from './ecs/components';
import { selectAvailableComponentsList, selectActiveComponentId } from './project/selectors';
import { ObjectList } from './list-objects';

export const ComponentList = () => {
  const dispatch = useDispatch();
  const components = useSelector(
    selectAvailableComponentsList,
    (prev, next) => prev === next || shallowEqual(
      prev.map(({ label }) => label),
      next.map(({ label }) => label),
    ),
  );
  const activeComponentId = useSelector(selectActiveComponentId);

  return (
    <ObjectList
      objects={components}
      activeId={activeComponentId}
      onSelect={({ id }) => dispatch(setActiveComponentAction(id))}
      onAdd={() => dispatch(addUserDefinedComponentAction(newUserDefinedComponent()))}
      addLabel="Add Component"
      activeHint="= $c"
    />
  );
}
