import { TransformComponent } from '../components/Transform';
import { MotionComponent } from '../components/Motion';

export class MovementSystem {
  static name = 'Movement';
  static requiredComponents = [TransformComponent, MotionComponent];

  Transform = null;
  Motion = null;

  loop_update() {
    const { Transform, Motion } = this;
    const { x, y } = Transform;
    const { velocity_x, velocity_y, acceleration_x, acceleration_y } = Motion;

    return (entities, dt) => {
      entities.forEach((entity) => {
        x[entity] += velocity_x[entity] * dt;
        y[entity] += velocity_y[entity] * dt;

        velocity_x[entity] += acceleration_x[entity] * dt;
        velocity_y[entity] += acceleration_y[entity] * dt;
      });
    };
  }
}
