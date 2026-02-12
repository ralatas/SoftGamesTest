import { Container, Graphics, Rectangle } from "pixi.js";
import { ScrollBar } from "../../../../ui/ScrollBar";
import { MAGIC_WORDS_CONFIG } from "../MagicWordsConfig";

export class MagicWordsScrollView extends Container {
  public readonly contentRoot = new Container();

  private contentMask = new Graphics();
  private dataContainer = new Container();
  private scrollBar: ScrollBar;

  private viewportWidth: number = MAGIC_WORDS_CONFIG.scroll.defaultViewportWidth;
  private viewportHeight: number = MAGIC_WORDS_CONFIG.scroll.defaultViewportHeight;
  private contentHeight = 0;
  private maxScroll = 0;
  private scrollOffset = 0;
  private dragging = false;
  private dragStartY = 0;
  private dragStartOffset = 0;

  constructor() {
    super();

    this.scrollBar = new ScrollBar({
      onChange: (ratio) => {
        if (this.maxScroll <= 0) return;
        this.scrollOffset = ratio * this.maxScroll;
        this.applyScroll();
      },
    });

    this.dataContainer.mask = this.contentMask;
    this.dataContainer.eventMode = "static";
    this.dataContainer.on("pointerdown", this.onPointerDown);
    this.dataContainer.on("pointermove", this.onPointerMove);
    this.dataContainer.on("pointerup", this.onPointerUp);
    this.dataContainer.on("pointerupoutside", this.onPointerUp);
    this.dataContainer.on("pointercancel", this.onPointerUp);
    this.dataContainer.addChild(this.contentRoot);
    this.addChild(this.contentMask, this.dataContainer, this.scrollBar);
  }

  setLayout(x: number, y: number, width: number, height: number) {
    this.position.set(x, y);
    this.viewportWidth = Math.max(MAGIC_WORDS_CONFIG.scroll.minViewport, width);
    this.viewportHeight = Math.max(MAGIC_WORDS_CONFIG.scroll.minViewport, height);
    this.dataContainer.hitArea = new Rectangle(0, 0, this.viewportWidth, this.viewportHeight);

    this.contentMask.clear();
    this.contentMask.roundRect(
      0,
      0,
      this.viewportWidth,
      this.viewportHeight,
      MAGIC_WORDS_CONFIG.scroll.maskCornerRadius,
    );
    this.contentMask.fill(MAGIC_WORDS_CONFIG.scroll.maskColor);

    this.scrollBar.setLayout(
      this.viewportWidth - MAGIC_WORDS_CONFIG.scroll.scrollBarWidthOffset,
      MAGIC_WORDS_CONFIG.scroll.scrollBarTopOffset,
      this.viewportHeight - MAGIC_WORDS_CONFIG.scroll.scrollBarVerticalPadding,
    );
    this.updateScrollMetrics(false);
  }

  getViewportWidth(): number {
    return this.viewportWidth;
  }

  clearContent() {
    const removed = this.contentRoot.removeChildren();
    for (let i = 0; i < removed.length; i += 1) {
      removed[i].destroy({ children: true });
    }
    this.contentHeight = 0;
    this.maxScroll = 0;
    this.scrollOffset = 0;
    this.applyScroll();
  }

  setContentHeight(height: number, stickToBottom: boolean) {
    this.contentHeight = Math.max(0, height);
    this.updateScrollMetrics(stickToBottom);
  }

  onWheel(deltaY: number) {
    if (this.maxScroll <= 0) return;
    this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + deltaY));
    this.applyScroll();
  }

  private onPointerDown = (event: import("pixi.js").FederatedPointerEvent) => {
    if (this.maxScroll <= 0) {
      return;
    }
    this.dragging = true;
    this.dragStartY = event.global.y;
    this.dragStartOffset = this.scrollOffset;
  };

  private onPointerMove = (event: import("pixi.js").FederatedPointerEvent) => {
    if (!this.dragging || this.maxScroll <= 0) {
      return;
    }

    const deltaY = event.global.y - this.dragStartY;
    this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.dragStartOffset - deltaY));
    this.applyScroll();
  };

  private onPointerUp = () => {
    this.dragging = false;
  };

  private updateScrollMetrics(stickToBottom: boolean) {
    this.maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
    if (stickToBottom) {
      this.scrollOffset = this.maxScroll;
    } else {
      this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset));
    }
    this.applyScroll();
  }

  private applyScroll() {
    this.contentRoot.y = -this.scrollOffset;
    this.scrollBar.setMetrics(this.viewportHeight, Math.max(this.viewportHeight, this.contentHeight));
    const ratio = this.maxScroll <= 0 ? 0 : this.scrollOffset / this.maxScroll;
    this.scrollBar.setRatio(ratio);
  }
}
