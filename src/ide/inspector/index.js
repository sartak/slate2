import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { InspectEntity } from './entity';
import { selectActiveTypeId } from '../project/selectors';
import './index.less';

export const Inspector = () => {
  const [type, id] = useSelector(selectActiveTypeId, shallowEqual);

  return (
    <div className="Inspector">
      {type === "Entity" && <InspectEntity entityId={id} />}
    </div>
  );
}
