import { TransformComponent } from '../components/Transform';
import { RenderRectangleComponent } from '../components/RenderRectangle';

export class RenderSystem {
  static name = 'Render';
  static requiredComponents = [TransformComponent, RenderRectangleComponent];

  Transform = null;
  RenderRectangle = null;

  loop_render_canvas(ctx) {
    const { Transform, RenderRectangle } = this;
    const { x, y, z, rotation, scale_x, scale_y } = Transform;
    const { w, h, color } = RenderRectangle;

    return (entities, dt) => {
      // @Todo: implement parenting
      entities.sort((a, b) => z[b] - z[a]).forEach((entity) => {
        ctx.save();

        const sx = scale_x[entity];
        const sy = scale_y[entity];
        const px = x[entity];
        const py = y[entity];
        const width = w[entity];
        const height = h[entity];
        const cx = px + sx * width / 2;
        const cy = py + sy * height / 2;

        ctx.fillStyle = color[entity];

        ctx.transform(sx, 0, 0, sy, cx, cy);
        ctx.rotate(rotation[entity]);
        ctx.translate(-cx, -cy);
        ctx.fillRect(px, py, width, height);

        ctx.restore();
      });
    };
  }
}
