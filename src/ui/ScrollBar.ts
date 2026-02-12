import { Container, FederatedPointerEvent, Graphics } from "pixi.js";

type ScrollBarOptions = {
  onChange: (ratio: number) => void;
  width?: number;
  minThumbHeight?: number;
};

export class ScrollBar extends Container {
  private track = new Graphics();
  private thumb = new Graphics();

  private onChange: (ratio: number) => void;
  private barWidth: number;
  private minThumbHeight: number;

  private barHeight = 100;
  private viewportHeight = 1;
  private contentHeight = 1;
  private ratio = 0;

  private dragging = false;
  private dragOffsetY = 0;

  constructor(options: ScrollBarOptions) {
    super();
    this.onChange = options.onChange;
    this.barWidth = options.width ?? 8;
    this.minThumbHeight = options.minThumbHeight ?? 28;

    this.addChild(this.track, this.thumb);
    this.eventMode = "static";

    this.track.eventMode = "static";
    this.thumb.eventMode = "static";
    this.thumb.cursor = "pointer";

    this.track.on("pointerdown", this.onTrackDown);
    this.thumb.on("pointerdown", this.onThumbDown);
    this.on("pointermove", this.onPointerMove);
    this.on("pointerup", this.onPointerUp);
    this.on("pointerupoutside", this.onPointerUp);

    this.redraw();
  }

  setLayout(x: number, y: number, height: number) {
    this.position.set(x, y);
    this.barHeight = Math.max(24, height);
    this.redraw();
  }

  setMetrics(viewportHeight: number, contentHeight: number) {
    this.viewportHeight = Math.max(1, viewportHeight);
    this.contentHeight = Math.max(1, contentHeight);
    this.visible = this.contentHeight > this.viewportHeight;
    this.redraw();
  }

  setRatio(ratio: number) {
    this.ratio = this.clamp01(ratio);
    this.redraw();
  }

  private redraw() {
    const thumbHeight = this.getThumbHeight();
    const maxY = Math.max(0, this.barHeight - thumbHeight);
    const thumbY = maxY * this.ratio;

    this.track.clear();
    this.track.roundRect(0, 0, this.barWidth, this.barHeight, this.barWidth / 2);
    this.track.fill({ color: 0x2a325f, alpha: 0.75 });

    this.thumb.clear();
    this.thumb.roundRect(0, thumbY, this.barWidth, thumbHeight, this.barWidth / 2);
    this.thumb.fill({ color: 0xf3a74f, alpha: 0.95 });
  }

  private getThumbHeight(): number {
    if (this.contentHeight <= this.viewportHeight) {
      return this.barHeight;
    }
    const raw = this.barHeight * (this.viewportHeight / this.contentHeight);
    return Math.max(this.minThumbHeight, Math.min(this.barHeight, raw));
  }

  private onTrackDown = (event: FederatedPointerEvent) => {
    if (!this.visible) return;
    const local = this.toLocal(event.global);
    this.updateRatioFromY(local.y - this.getThumbHeight() / 2);
  };

  private onThumbDown = (event: FederatedPointerEvent) => {
    if (!this.visible) return;
    const local = this.toLocal(event.global);
    const thumbY = this.ratio * Math.max(0, this.barHeight - this.getThumbHeight());
    this.dragOffsetY = local.y - thumbY;
    this.dragging = true;
  };

  private onPointerMove = (event: FederatedPointerEvent) => {
    if (!this.dragging || !this.visible) return;
    const local = this.toLocal(event.global);
    this.updateRatioFromY(local.y - this.dragOffsetY);
  };

  private onPointerUp = () => {
    this.dragging = false;
  };

  private updateRatioFromY(thumbY: number) {
    const maxY = Math.max(0, this.barHeight - this.getThumbHeight());
    const nextRatio = maxY <= 0 ? 0 : this.clamp01(thumbY / maxY);
    this.ratio = nextRatio;
    this.redraw();
    this.onChange(nextRatio);
  }

  private clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
