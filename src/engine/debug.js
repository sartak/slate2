const RectWidth = 8;
const RectGap = 2;
const HeightPerMs = 10;
const Overage = 1.2;
const FramesPerRender = 60;
const TargetFPS = 60;

const RectsPerFrame = 3; // update, render, leftover
const MsPerFrame = Math.floor(1000.0 / TargetFPS);
const ChartWidth = RectGap + FramesPerRender * (RectGap + RectWidth);
const ChartHeight = Math.ceil(HeightPerMs * MsPerFrame * Overage);

export default class Debugger {
  container = null;
  chart = null;
  frameStartMs = null;
  updateStartMs = null;
  updateEndMs = null;
  renderStartMs = null;
  renderEndMs = null;
  frames = new Array(FramesPerRender);
  rects = new Array(FramesPerRender * RectsPerFrame);
  fpsDisplay = null;
  frameIndex = 0;

  attach(container) {
    this.container = container;
    this.initialRender();
  }

  frameBegin() {
    this.frameStartMs = window.performance.now();
  }

  updateBegin() {
    this.updateStartMs = window.performance.now();
  }

  updateEnd() {
    this.updateEndMs = window.performance.now();
  }

  renderBegin() {
    this.renderStartMs = window.performance.now();
  }

  renderEnd() {
    this.renderEndMs = window.performance.now();
  }

  frameEnd() {
    this.frames[this.frameIndex] = [
      this.frameStartMs,
      this.updateStartMs,
      this.updateEndMs,
      this.renderStartMs,
      this.renderEndMs,
      window.performance.now(),
    ];

    this.frameStartMs = this.updateStartMs = this.updateEndMs = this.renderStartMs = this.renderEndMs = null;

    if (++this.frameIndex === FramesPerRender) {
      this.frameIndex = 0;
      this.render();
    }
  }

  initialRender() {
    const { container, rects } = this;

    const chart = this.chart = document.createElement('div');
    chart.classList.add('chart');

    chart.style.width = `${ChartWidth}px`;
    chart.style.height = `${ChartHeight}px`;

    for (let i = 0; i < FramesPerRender * RectsPerFrame; ++i) {
      const rect = rects[i] = document.createElement('div');
      const style = rect.style;
      rect.classList.add('bar');
      style.width = `${RectWidth}px`;
      style.left = `${RectGap + Math.floor(i / 3) * (RectGap + RectWidth)}px`;

      let type;
      switch (i % 3) {
        case 0:
          type = 'update';
          break;
        case 1:
          type = 'render';
          break;
        case 2:
          type = 'leftover';
          break;
      }
      rect.classList.add(type);

      chart.appendChild(rect);
    }

    const target = document.createElement('div');
    target.classList.add('target');
    target.style.width = `${ChartWidth}px`;
    target.style.top = `${ChartHeight - MsPerFrame * HeightPerMs}px`;
    target.style.height = '1px';
    target.style.left = 0;
    chart.appendChild(target);

    container.appendChild(chart);

    const fpsDisplay = this.fpsDisplay = document.createElement('div');
    fpsDisplay.classList.add('fps');

    container.appendChild(fpsDisplay);
  }

  render() {
    const { container, frames, rects, fpsDisplay } = this;

    let totalMs = 0;

    frames.forEach((frame, i) => {
      const [frameStart, updateStart, updateEnd, renderStart, renderEnd, frameEnd] = frame;
      const updateMs = updateEnd - updateStart;
      const renderMs = renderEnd - renderStart;
      const leftoverMs = frameEnd - frameStart - updateMs - renderMs;
      totalMs += frameEnd - frameStart;

      const updateHeight = Math.ceil(HeightPerMs * updateMs);
      const renderHeight = Math.ceil(HeightPerMs * renderMs);
      const leftoverHeight = Math.ceil(HeightPerMs * leftoverMs);

      const updateRect = rects[i * 3 + 0];
      const renderRect = rects[i * 3 + 1];
      const leftoverRect = rects[i * 3 + 2];

      updateRect.style.height = `${updateHeight}px`;
      renderRect.style.height = `${renderHeight}px`;
      leftoverRect.style.height = `${leftoverHeight}px`;

      updateRect.style.top = `${ChartHeight - updateHeight}px`;
      renderRect.style.top = `${ChartHeight - updateHeight - renderHeight}px`;
      leftoverRect.style.top = `${ChartHeight - updateHeight - renderHeight - leftoverHeight}px`;
    });

    let imaginaryFps = (1000.0 / (totalMs / frames.length));

    let realTotalMs = frames[frames.length - 1][5] - frames[0][0];
    let realFps = (1000.0 / (realTotalMs / frames.length));

    fpsDisplay.innerText = `FPS: ${realFps.toFixed(1)} (${imaginaryFps.toFixed(1)})`;
  }
};
