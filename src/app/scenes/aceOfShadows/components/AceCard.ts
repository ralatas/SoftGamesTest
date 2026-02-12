import { Sprite, Texture } from "pixi.js";
import type { CardPose } from "../AceOfShadows.types";
import { ACE_OF_SHADOWS_CONFIG } from "../AceOfShadowsConfig";

export class AceCard extends Sprite {
  constructor(index: number) {
    super(Texture.WHITE);
    this.anchor.set(0.5);
    this.tint = AceCard.cardTint(index);
  }

  applyPose(pose: CardPose, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.position.set(pose.x, pose.y);
    this.zIndex = pose.z;
  }

  private static cardTint(index: number): number {
    const hue = (index * ACE_OF_SHADOWS_CONFIG.tint.hueStep) % ACE_OF_SHADOWS_CONFIG.tint.hueCircle;
    const c = ACE_OF_SHADOWS_CONFIG.tint.chroma;
    const x = c * (1 - Math.abs(((hue / ACE_OF_SHADOWS_CONFIG.tint.hueSectorSize) % 2) - 1));
    const m = ACE_OF_SHADOWS_CONFIG.tint.match;

    let r = 0;
    let g = 0;
    let b = 0;

    if (hue < ACE_OF_SHADOWS_CONFIG.tint.threshold1) {
      r = c;
      g = x;
      b = 0;
    } else if (hue < ACE_OF_SHADOWS_CONFIG.tint.threshold2) {
      r = x;
      g = c;
      b = 0;
    } else if (hue < ACE_OF_SHADOWS_CONFIG.tint.threshold3) {
      r = 0;
      g = c;
      b = x;
    } else if (hue < ACE_OF_SHADOWS_CONFIG.tint.threshold4) {
      r = 0;
      g = x;
      b = c;
    } else if (hue < ACE_OF_SHADOWS_CONFIG.tint.threshold5) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    const rr = Math.floor((r + m) * ACE_OF_SHADOWS_CONFIG.tint.channelScale);
    const gg = Math.floor((g + m) * ACE_OF_SHADOWS_CONFIG.tint.channelScale);
    const bb = Math.floor((b + m) * ACE_OF_SHADOWS_CONFIG.tint.channelScale);
    return (rr << ACE_OF_SHADOWS_CONFIG.tint.redShift)
      | (gg << ACE_OF_SHADOWS_CONFIG.tint.greenShift)
      | bb;
  }
}
