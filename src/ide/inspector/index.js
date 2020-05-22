import React from 'react';
import { useSelector } from 'react-redux';
import { InspectEntity } from './entity';
import { selectActiveEntityId } from '../project/selectors';
import './index.less';

export const Inspector = () => {
  const entityId = useSelector(selectActiveEntityId);

  return (
    <div className="Inspector">
      {entityId !== null && <InspectEntity entityId={entityId} />}
    </div>
  );
}
