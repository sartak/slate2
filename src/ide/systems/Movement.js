import { BaseSystem } from './base';
import { TransformComponentId } from '../components/Transform';
import { MotionComponentId } from '../components/Motion';

export const MovementSystemId = 'MovementSystem';

export class MovementSystem extends BaseSystem {
  static name = 'Movement';
  static id = MovementSystemId;
  id = MovementSystemId;
  static label = 'Movement';
  label = 'Movement';
  static requiredComponents = [TransformComponentId, MotionComponentId];
  requiredComponents = [TransformComponentId, MotionComponentId];

  update(entities, dt, time) {
    entities.forEach((entity) => {
      entity.Transform.x += entity.Motion.velocity_x * dt;
      entity.Transform.y += entity.Motion.velocity_y * dt;

      entity.Motion.velocity_x += entity.Motion.acceleration_x * dt;
      entity.Motion.velocity_y += entity.Motion.acceleration_y * dt;
    });
  }
}
