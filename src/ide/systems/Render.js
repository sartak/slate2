import { TransformComponent } from '../components/Transform';
import { RenderRectangleComponent } from '../components/RenderRectangle';

export class RenderSystem {
  static name = 'Render';
  static requiredComponents = [TransformComponent, RenderRectangleComponent];

  loop_render_canvas(ctx, entities, dt, time) {
    entities.slice().sort((a, b) => b.Transform.z - a.Transform.z).forEach((entity) => {
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
    });
  }
}
