import React from 'react';
import { useSelector } from 'react-redux';
import { makeSelectSystem } from '../project/selectors';

export const InspectSystem = ({ id }) => {
  const system = useSelector(makeSelectSystem(id));

  return (
    <div className="InspectObject">
      <div className="label">{system.label}</div>
    </div>
  );
};
