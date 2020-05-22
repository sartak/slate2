import { TransformComponentId } from '../components/transform';
import { RenderRectangleComponentId } from '../components/render-rectangle';
import { lookupComponentWithId } from './components';

export const newEntity = (x, y) => {
  // @Cleanup: lookupComponentWithId takes a project in order to be able
  // to instantiate a user-defined component by id on demand. However,
  // we know builtin components won't need that. I could refactor to get
  // rid of this, but this method is going to go away at some point in favor
  // of prefabs.
  const transform = lookupComponentWithId(null, TransformComponentId);
  const renderRectangle = lookupComponentWithId(null, RenderRectangleComponentId);

  return {
    id: null, // to be filled in by caller
    label: 'Entity',

    componentIds: [TransformComponentId, RenderRectangleComponentId],
    componentConfig: {
      [TransformComponentId]: transform.makeEntityComponent({x, y}),
      [RenderRectangleComponentId]: renderRectangle.makeEntityComponent(),
    },
  };
};
