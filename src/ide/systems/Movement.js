import { TransformComponent } from '../components/Transform';
import { MotionComponent } from '../components/Motion';

export class MovementSystem {
  static name = 'Movement';
  static requiredComponents = [TransformComponent, MotionComponent];

  loop_update(entities, dt, time) {
    entities.forEach((entity) => {
      entity.Transform.x += entity.Motion.velocity_x * dt;
      entity.Transform.y += entity.Motion.velocity_y * dt;

      entity.Motion.velocity_x += entity.Motion.acceleration_x * dt;
      entity.Motion.velocity_y += entity.Motion.acceleration_y * dt;
    });
  }
}
