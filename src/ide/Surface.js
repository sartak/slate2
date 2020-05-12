import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import CanvasRenderer from './renderer/canvas';
import WebGLRenderer from './renderer/webgl';
import WebGPURenderer from './renderer/webgpu';

const rendererForType = (type) => {
  switch (type) {
    case 'canvas': return CanvasRenderer;
    case 'webgl': return WebGLRenderer;
    case 'webgpu': return WebGPURenderer;
    default: throw new Error(`Unknown renderer type '${type}'`);
  }
};

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
