import { TransformComponent } from '../components/transform';
import { MotionComponent } from '../components/motion';
import { JoystickComponent } from '../components/joystick';
import { RenderRectangleComponent } from '../components/render-rectangle';
import { UserDefinedComponent } from '../components/user-defined';

export const BuiltinComponents = [
  new TransformComponent,
  new MotionComponent,
  new JoystickComponent,
  new RenderRectangleComponent,
];

export const newUserDefinedComponent = () => {
  return {
    id: null, // to be filled in by caller
    label: null, // to be filled in by caller
  };
};

const selectComponentWithIdMemo = {};
BuiltinComponents.forEach((component) => {
  selectComponentWithIdMemo[component.id] = component;
});

export const lookupComponentWithId = (project, componentId) => {
  const builtin = selectComponentWithIdMemo[componentId];
  if (builtin) {
    return builtin;
  }

  // @Performance: memoize
  const config = project.userDefinedComponents[componentId];
  return new UserDefinedComponent(config);
};
