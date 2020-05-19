import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { commitSurfaceTransformAction } from './project/actions';
import { rendererForType } from './renderer';
import { TransformComponentId } from './components/transform';
import { usePreflight } from './preflight';
import { selectRenderer, selectSurface, selectActiveEntityIndex } from './project/selectors';
import { useLiveEntityComponentValues } from './preflight/useLiveEntityComponentValues';
import * as liveCallbackModes from './preflight/live-entity-values';

export const Surface = () => {
  const dispatch = useDispatch();

  const preflight = usePreflight();
  const rendererType = useSelector(selectRenderer);
  const surfaceOpts = useSelector(selectSurface, shallowEqual);
  const activeEntityIndex = useSelector(selectActiveEntityIndex);

  const rendererRef = useRef(null);
  const surfaceRef = useRef(null);

  const setSurfaceRefCallback = useCallback((surface) => {
    surfaceRef.current = surface;

    const renderer = rendererRef.current;
    if (renderer) {
      renderer.detach();
      renderer.attach(surface);
      renderer.render();
    }
  }, []);

  useEffect(() => {
    // @Cleanup: When hot-loading preflight we get a null value here
    if (!preflight) {
      return;
    }

    const rendererClass = rendererForType(rendererType);

    const renderer = new rendererClass(preflight, surfaceOpts, (opts) => {
      dispatch(commitSurfaceTransformAction(opts));
    });

    rendererRef.current = renderer;

    renderer.attach(surfaceRef.current);
    renderer.render();

    return () => {
      renderer.detach();
      rendererRef.current = null;
    };
  }, [rendererType]);

  useEffect(() => {
    const handleResize = () => rendererRef.current?.didResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  rendererRef.current?.changeTransform(surfaceOpts);

  useLiveEntityComponentValues((mode, { x, y }) => {
    const renderer = rendererRef.current;
    if (renderer) {
      const {width, height} = renderer;
      x -= width / 2;
      y -= height / 2;
    }

    switch (mode) {
      case liveCallbackModes.DESIGN_TIME: {
        dispatch(commitSurfaceTransformAction({
          ...surfaceOpts,
          panX: -x,
          panY: -y,
          zoom: 1,
        }));
        break;
      }

      case liveCallbackModes.PREFLIGHT_STOPPED:
      case liveCallbackModes.PREFLIGHT_RUNNING: {
        rendererRef.current?.changeTransform({
          ...surfaceOpts,
          panX: -x,
          panY: -y,
          zoom: 1,
        });
      }
    }
  }, activeEntityIndex, TransformComponentId);

  return (
    <div className="Surface" ref={setSurfaceRefCallback} />
  );
};
