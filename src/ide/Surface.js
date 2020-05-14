import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { commitSurfaceTransformAction } from './project';
import { rendererForType } from './renderer';

const useSelectedEntityChangeCallback = (callback, entities, selectedEntityIndex) => {
  const prev = useRef(null);

  useEffect(() => {
    if (prev.current === null) {
      prev.current = selectedEntityIndex;
      return;
    }

    callback(entities[selectedEntityIndex]);
  }, [selectedEntityIndex]);
};

export const Surface = () => {
  const dispatch = useDispatch();
  const rendererType = useSelector(project => project.renderer);
  const surfaceOpts = useSelector(project => project.surface);
  const rendererRef = useRef(null);
  const surfaceRef = useRef(null);
  const entities = useSelector(project => project.entities);
  const selectedEntityIndex = useSelector(project => project.selectedEntityIndex);

  const surfaceCallback = useCallback((surface) => {
    surfaceRef.current = surface;

    const renderer = rendererRef.current;
    if (renderer) {
      renderer.detach();
      renderer.attach(surface);
      renderer.render();
    }
  }, []);

  useEffect(() => {
    const rendererClass = rendererForType(rendererType);

    const renderer = new rendererClass(surfaceOpts, (opts) => {
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
    if (rendererRef.current) {
      rendererRef.current.didResize();
    }
  });

  useLayoutEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  if (rendererRef.current) {
    rendererRef.current.changeTransform(surfaceOpts);
  }

  useSelectedEntityChangeCallback((entity) => {
    entity.components.forEach((entityComponent) => {
      if (entityComponent.name === 'TransformComponent') {
        const {x, y} = entityComponent.fields;
        dispatch(commitSurfaceTransformAction({
          ...surfaceOpts,
          panX: x,
          panY: y,
          zoom: 1,
        }));
      }
    });
  }, entities, selectedEntityIndex);

  return (
    <div className="Surface" ref={surfaceCallback} />
  );
};
