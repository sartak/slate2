import { BaseSystem } from './base';
import { TransformComponentId } from '../components/transform';
import { RenderRectangleComponentId } from '../components/render-rectangle';

export const RenderSystemId = 'RenderSystem';

export class RenderSystem extends BaseSystem {
  id = RenderSystemId;
  label = 'Render';
  requiredComponents = [TransformComponentId, RenderRectangleComponentId];

  render_canvas(ctx, entities, dt, time) {
    const sortedEntities = entities.slice().sort((a, b) => b.Transform.z - a.Transform.z);
    for (let i = 0, len = sortedEntities.length; i < len; ++i) {
      const entity = sortedEntities[i];

      ctx.save();

      const sx = entity.Transform.scale_x;
      const sy = entity.Transform.scale_y;
      const px = entity.Transform.x;
      const py = entity.Transform.y;
      const width = entity.RenderRectangle.w;
      const height = entity.RenderRectangle.h;
      const cx = px + sx * width / 2;
      const cy = py + sy * height / 2;

      ctx.fillStyle = entity.RenderRectangle.color;

      ctx.transform(sx, 0, 0, sy, cx, cy);
      ctx.rotate(entity.Transform.rotation);
      ctx.translate(-cx, -cy);
      ctx.fillRect(px, py, width, height);

      ctx.restore();
    }
  }

  hitTest(entities, x, y, all) {
    const sortedEntities = entities.slice().sort((a, b) => a.Transform.z - b.Transform.z);
    const ret = [];

    for (let i = 0, len = sortedEntities.length; i < len; ++i) {
      const entity = sortedEntities[i];

      const sx = entity.Transform.scale_x;
      const sy = entity.Transform.scale_y;
      const px = entity.Transform.x;
      const py = entity.Transform.y;
      const width = entity.RenderRectangle.w;
      const height = entity.RenderRectangle.h;
      const cx = px + sx * width / 2;
      const cy = py + sy * height / 2;

      let ex = x;
      let ey = y;

      // TODO
      /*
      ctx.transform(sx, 0, 0, sy, cx, cy);
      ctx.rotate(entity.Transform.rotation);
      ctx.translate(-cx, -cy);
      ctx.fillRect(px, py, width, height);
      */
      continue;

      if (ex < 0 || ex > width || ey < 0 || ey > height) {
        continue;
      }

      if (all) {
        ret.push(entity);
      } else {
        return entity;
      }
    }

    return all ? ret : null;
  }
}
