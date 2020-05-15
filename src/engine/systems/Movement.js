import { TransformComponent } from '../components/Transform';
import { MotionComponent } from '../components/Motion';

export class MovementSystem {
  static name = 'Movement';
  static requiredComponents = [TransformComponent, MotionComponent];

  Transform = null;
  Motion = null;

  loop() {
    const { Transform, Motion } = this;

    return (entities, dt) => {
      entities.forEach((entity) => {
        Transform.x[entity] += Motion.velocity_x[entity] * dt;
        Transform.y[entity] += Motion.velocity_y[entity] * dt;

        Motion.velocity_x[entity] += Motion.acceleration_x[entity] * dt;
        Motion.velocity_y[entity] += Motion.acceleration_y[entity] * dt;
      });
    };
  }
}
