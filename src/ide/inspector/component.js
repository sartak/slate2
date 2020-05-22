import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDefinedComponentLabelAction, addFieldToUserDefinedComponentAction } from '../project/actions';
import { makeSelectComponent } from '../project/selectors';
import { newUserDefinedField } from '../ecs/components';
import { TextControlled } from '../field/text-controlled';

export const InspectUserDefinedComponentLabel = ({ id }) => {
  const dispatch = useDispatch();
  const component = useSelector(
    makeSelectComponent(id),
    (prev, next) => prev.label === next.label,
  );

  const { label } = component;
  const setLabel = (label) => dispatch(setUserDefinedComponentLabelAction(id, label));

  return (
    <div className="InspectLabel">
      <TextControlled
        value={label}
        defaultValue={`Component${id}`}
        onChange={setLabel}
      />
    </div>
  );
};

const AddFieldToComponent = ({ id }) => {
  const dispatch = useDispatch();

  const addField = () => dispatch(addFieldToUserDefinedComponentAction(id, newUserDefinedField()));

  return <button onClick={addField}>Add Field</button>;
};

export const InspectComponent = ({ id }) => {
  const component = useSelector(makeSelectComponent(id));

  const { userDefined } = component;

  return (
    <div className="InspectObject">
      { userDefined ? (
        <InspectUserDefinedComponentLabel id={id} />
      ) : (
        <div className="label">{component.label}</div>
      )}
      <div className="controls">
        { userDefined && <AddFieldToComponent id={id} /> }
      </div>
    </div>
  );
};
