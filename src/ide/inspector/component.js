import React from 'react';
import { useSelector } from 'react-redux';
import { makeSelectComponent } from '../project/selectors';

export const InspectComponent = ({ id }) => {
  const component = useSelector(makeSelectComponent(id));

  return (
    <div className="InspectObject">
      <div className="label">{component.label}</div>
    </div>
  );
};
