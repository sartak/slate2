import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDefinedComponentLabelAction } from '../project/actions';
import { makeSelectComponent } from '../project/selectors';
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
    </div>
  );
};
