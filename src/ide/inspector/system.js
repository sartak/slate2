import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDefinedSystemLabelAction } from '../project/actions';
import { makeSelectSystem } from '../project/selectors';
import { TextControlled } from '../field/text-controlled';

export const InspectUserDefinedSystemLabel = ({ id }) => {
  const dispatch = useDispatch();
  const system = useSelector(
    makeSelectSystem(id),
    (prev, next) => prev.label === next.label,
  );

  const { label } = system;
  const setLabel = (label) => dispatch(setUserDefinedSystemLabelAction(id, label));

  return (
    <div className="InspectLabel">
      <TextControlled
        value={label}
        defaultValue={`System${id}`}
        onChange={setLabel}
      />
    </div>
  );
};

export const InspectSystem = ({ id }) => {
  const system = useSelector(makeSelectSystem(id));

  const { userDefined } = system;

  return (
    <div className="InspectObject">
      { userDefined ? (
        <InspectUserDefinedSystemLabel id={id} />
      ) : (
        <div className="label">{system.label}</div>
      )}
    </div>
  );
};
