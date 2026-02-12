import type { CardPose, MovingCardState } from "../AceOfShadows.types";
import { ACE_OF_SHADOWS_CONFIG } from "../AceOfShadowsConfig";

export class AceOfShadowsService {
  static readonly TOTAL_CARDS = ACE_OF_SHADOWS_CONFIG.gameplay.totalCards;
  static readonly STACK_COUNT = ACE_OF_SHADOWS_CONFIG.gameplay.stackCount;

  private static readonly MOVE_INTERVAL_MS = ACE_OF_SHADOWS_CONFIG.gameplay.moveIntervalMs;
  private static readonly MOVE_DURATION_MS = ACE_OF_SHADOWS_CONFIG.gameplay.moveDurationMs;
  private static readonly STACK_OFFSET_Y = ACE_OF_SHADOWS_CONFIG.layout.stackOffsetY;

  private stacks: number[][] = [];
  private pendingIncoming: number[] = [];
  private movingCards: MovingCardState[] = [];

  private poses: CardPose[] = [];

  private viewportWidth = 0;
  private viewportHeight = 0;
  private cardWidth: number = ACE_OF_SHADOWS_CONFIG.layout.cardWidthInitial;
  private cardHeight: number = ACE_OF_SHADOWS_CONFIG.layout.cardHeightInitial;

  private elapsedMs = 0;
  private moveTimerMs = 0;
  private zCounter = ACE_OF_SHADOWS_CONFIG.gameplay.zCounterStart;

  constructor() {
    this.reset();
  }

  reset() {
    const cardsPerStack = AceOfShadowsService.TOTAL_CARDS / AceOfShadowsService.STACK_COUNT;
    this.stacks = Array.from({ length: AceOfShadowsService.STACK_COUNT }, () => []);
    this.pendingIncoming = Array.from({ length: AceOfShadowsService.STACK_COUNT }, () => 0);

    for (let i = 0; i < AceOfShadowsService.TOTAL_CARDS; i += 1) {
      const stackIndex = Math.floor(i / cardsPerStack);
      this.stacks[stackIndex].push(i);
    }

    this.movingCards = [];
    this.poses = Array.from({ length: AceOfShadowsService.TOTAL_CARDS }, () => ({ x: 0, y: 0, z: 0 }));
    this.elapsedMs = 0;
    this.moveTimerMs = 0;
    this.zCounter = ACE_OF_SHADOWS_CONFIG.gameplay.zCounterStart;
    this.layoutStacks();
  }

  setViewport(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.cardWidth = Math.max(
      ACE_OF_SHADOWS_CONFIG.layout.minCardWidth,
      Math.min(
        ACE_OF_SHADOWS_CONFIG.layout.maxCardWidth,
        Math.floor(width / ACE_OF_SHADOWS_CONFIG.layout.cardWidthDivisor),
      ),
    );
    this.cardHeight = Math.floor(this.cardWidth * ACE_OF_SHADOWS_CONFIG.layout.cardAspectRatio);
    this.layoutStacks();
  }

  tick(deltaMs: number) {
    this.elapsedMs += deltaMs;
    this.moveTimerMs += deltaMs;

    while (this.moveTimerMs >= AceOfShadowsService.MOVE_INTERVAL_MS) {
      this.moveTimerMs -= AceOfShadowsService.MOVE_INTERVAL_MS;
      this.startMove();
    }

    this.updateMovingCards();
    this.layoutStacks();
  }

  getCardWidth(): number {
    return this.cardWidth;
  }

  getCardHeight(): number {
    return this.cardHeight;
  }

  getPoses(): CardPose[] {
    return this.poses;
  }

  private startMove() {
    const nonEmptyStacks = this.stacks
      .map((cards, index) => ({ index, count: cards.length }))
      .filter((entry) => entry.count > 0);

    if (nonEmptyStacks.length < 2) return;

    const source = nonEmptyStacks[Math.floor(Math.random() * nonEmptyStacks.length)].index;
    let target = source;
    while (target === source) {
      target = Math.floor(Math.random() * this.stacks.length);
    }

    const sourceStack = this.stacks[source];
    const cardId = sourceStack.pop();
    if (cardId === undefined) return;

    const sourceDepth = sourceStack.length;
    const targetDepth = this.stacks[target].length + this.pendingIncoming[target];
    const from = this.stackCardPosition(source, sourceDepth);
    const to = this.stackCardPosition(target, targetDepth);

    this.pendingIncoming[target] += 1;

    this.movingCards.push({
      cardId,
      toStack: target,
      startX: from.x,
      startY: from.y,
      endX: to.x,
      endY: to.y,
      startMs: this.elapsedMs,
    });
  }

  private updateMovingCards() {
    for (let i = this.movingCards.length - 1; i >= 0; i -= 1) {
      const moving = this.movingCards[i];
      const t = Math.min(1, (this.elapsedMs - moving.startMs) / AceOfShadowsService.MOVE_DURATION_MS);
      const eased = t < ACE_OF_SHADOWS_CONFIG.easing.midpoint
        ? ACE_OF_SHADOWS_CONFIG.easing.powerFactor * t * t
        : 1 - Math.pow(
            -ACE_OF_SHADOWS_CONFIG.easing.powerFactor * t
              + ACE_OF_SHADOWS_CONFIG.easing.powerFactor,
            ACE_OF_SHADOWS_CONFIG.easing.powerFactor,
          ) / ACE_OF_SHADOWS_CONFIG.easing.powerFactor;

      this.poses[moving.cardId] = {
        x: moving.startX + (moving.endX - moving.startX) * eased,
        y: moving.startY + (moving.endY - moving.startY) * eased,
        z: ACE_OF_SHADOWS_CONFIG.layout.movingCardZBase + this.zCounter,
      };

      if (t >= 1) {
        this.pendingIncoming[moving.toStack] -= 1;
        this.stacks[moving.toStack].push(moving.cardId);
        this.movingCards.splice(i, 1);
        this.zCounter += 1;
      }
    }
  }

  private layoutStacks() {
    for (let stackIndex = 0; stackIndex < this.stacks.length; stackIndex += 1) {
      const stack = this.stacks[stackIndex];
      for (let depth = 0; depth < stack.length; depth += 1) {
        const cardId = stack[depth];
        const position = this.stackCardPosition(stackIndex, depth);
        this.poses[cardId] = {
          x: position.x,
          y: position.y,
          z: stackIndex * ACE_OF_SHADOWS_CONFIG.layout.stackZStride + depth,
        };
      }
    }
  }

  private stackCardPosition(stackIndex: number, depth: number): { x: number; y: number } {
    const safeWidth = Math.max(this.viewportWidth, ACE_OF_SHADOWS_CONFIG.layout.minViewportSize);
    const safeHeight = Math.max(this.viewportHeight, ACE_OF_SHADOWS_CONFIG.layout.minViewportSize);

    const left = Math.max(
      ACE_OF_SHADOWS_CONFIG.layout.minHorizontalPadding,
      this.cardWidth * ACE_OF_SHADOWS_CONFIG.layout.sidePaddingCardWidthFactor,
    );
    const right = safeWidth - left;
    const step = AceOfShadowsService.STACK_COUNT > 1
      ? (right - left) / (AceOfShadowsService.STACK_COUNT - 1)
      : 0;
    const x = left + step * stackIndex;

    const baseY = safeHeight - this.cardHeight * ACE_OF_SHADOWS_CONFIG.layout.cardBaseYFactor;
    const y = baseY - depth * AceOfShadowsService.STACK_OFFSET_Y;

    return { x, y };
  }
}
