import React from 'react';
import { useSelector } from 'react-redux';
import { InspectEntity } from './entity';
import { selectSelectedEntityIndex } from '../project/selectors';
import './index.less';

export const Inspector = () => {
  const entityIndex = useSelector(selectSelectedEntityIndex);

  return (
    <div className="Inspector">
      {entityIndex !== -1 && <InspectEntity entityIndex={entityIndex} />}
    </div>
  );
}
