import { TransformComponentId } from '../components/Transform';
import { RenderRectangleComponentId } from '../components/RenderRectangle';
import { lookupComponentWithId } from './selectors';

export const newEntity = (x, y) => {
  const transform = lookupComponentWithId(null, TransformComponentId);
  const renderRectangle = lookupComponentWithId(null, RenderRectangleComponentId);

  return {
    __id: null, // to be filled in by caller

    componentIds: [TransformComponentId, RenderRectangleComponentId],
    componentConfig: {
      [TransformComponentId]: transform.makeEntityComponent({x, y}),
      [RenderRectangleComponentId]: renderRectangle.makeEntityComponent(),
    },
  };
};

