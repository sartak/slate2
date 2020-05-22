import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { InspectEntity } from './entity';
import { InspectComponent } from './component';
import { InspectSystem } from './system';
import { selectActiveTypeId } from '../project/selectors';
import './index.less';

export const Inspector = () => {
  const [type, id] = useSelector(selectActiveTypeId, shallowEqual);

  return (
    <div className="Inspector">
      {type === "Entity" && <InspectEntity id={id} />}
      {type === "Component" && <InspectComponent id={id} />}
      {type === "System" && <InspectSystem id={id} />}
    </div>
  );
}
