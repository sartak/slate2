import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { rendererForType } from './renderer';

export const Surface = () => {
  const rendererType = useSelector(project => project.renderer);
  const rendererRef = useRef(null);
  const surfaceRef = useRef(null);

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
    const renderer = new rendererClass();
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

  return (
    <div className="Surface" ref={surfaceCallback} />
  );
};
