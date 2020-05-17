import React, { useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PreflightContext } from '../preflight';
import { InspectEntity } from './entity';
import { selectSelectedEntityIndex } from '../project/selectors';
import './index.less';

export const Inspector = () => {
  const entityIndex = useSelector(selectSelectedEntityIndex);
  const dispatch = useDispatch();
  const preflight = useContext(PreflightContext);
  const ref = useCallback((container) => {
    // @Cleanup: When hot-loading preflight we get a null value here
    if (!preflight) {
      return;
    }

    container ? preflight.attachInspector(container) : preflight.detachInspector();
  });

  return (
    <div ref={ref} className="Inspector">
      {entityIndex !== -1 && <InspectEntity entityIndex={entityIndex} />}
    </div>
  );
}
