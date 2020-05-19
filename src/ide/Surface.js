import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { commitSurfaceTransformAction } from './project/actions';
import { rendererForType } from './renderer';
import { TransformComponentId } from './components/transform';
import { PreflightContext } from './preflight';
import { selectRenderer, selectSurface, selectSelectedEntityIndex } from './project/selectors';
import { useLiveEntityComponentValues } from './hooks/useLiveEntityComponentValues';

export const Surface = () => {
  const dispatch = useDispatch();

  const preflight = useContext(PreflightContext);
  const rendererType = useSelector(selectRenderer);
  const surfaceOpts = useSelector(selectSurface, shallowEqual);
  const selectedEntityIndex = useSelector(selectSelectedEntityIndex);

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

  const handleResize = useCallback(() => {
    rendererRef.current?.didResize();
  });

  useLayoutEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  rendererRef.current?.changeTransform(surfaceOpts);

  useLiveEntityComponentValues(({ x, y }) => {
    const renderer = rendererRef.current;
    if (renderer) {
      const {width, height} = renderer;
      x -= width / 2;
      y -= height / 2;
    }

    dispatch(commitSurfaceTransformAction({
      ...surfaceOpts,
      panX: -x,
      panY: -y,
      zoom: 1,
    }));
  }, selectedEntityIndex, TransformComponentId);

  return (
    <div className="Surface" ref={setSurfaceRefCallback} />
  );
};
