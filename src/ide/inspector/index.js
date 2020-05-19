import React from 'react';
import { useSelector } from 'react-redux';
import { InspectEntity } from './entity';
import { selectActiveEntityIndex } from '../project/selectors';
import './index.less';

export const Inspector = () => {
  const entityIndex = useSelector(selectActiveEntityIndex);

  return (
    <div className="Inspector">
      {entityIndex !== -1 && <InspectEntity entityIndex={entityIndex} />}
    </div>
  );
}
