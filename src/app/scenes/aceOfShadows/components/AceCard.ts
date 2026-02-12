import { Container, Sprite, Text, TextStyle, Texture } from "pixi.js";
import type { CardPose } from "../AceOfShadows.types";
import { ACE_OF_SHADOWS_CONFIG } from "../AceOfShadowsConfig";

export class AceCard extends Container {
  private face: Sprite;
  private topRank: Text;
  private bottomRank: Text;

  constructor(index: number) {
    super();
    this.face = new Sprite(Texture.WHITE);
    this.face.anchor.set(0.5);
    this.face.tint = AceCard.cardTint(index);

    const rank = AceCard.cardRank(index);
    const style = new TextStyle({
      fill: ACE_OF_SHADOWS_CONFIG.cardLabel.fill,
      fontSize: ACE_OF_SHADOWS_CONFIG.cardLabel.fontSize,
      fontWeight: ACE_OF_SHADOWS_CONFIG.cardLabel.fontWeight,
      stroke: {
        color: ACE_OF_SHADOWS_CONFIG.cardLabel.strokeColor,
        width: ACE_OF_SHADOWS_CONFIG.cardLabel.strokeWidth,
      },
    });

    this.topRank = new Text({ text: rank, style });
    this.bottomRank = new Text({ text: rank, style });
    this.topRank.anchor.set(0, 0);
    this.bottomRank.anchor.set(0, 0);
    this.bottomRank.rotation = Math.PI;
    this.addChild(this.face, this.topRank, this.bottomRank);
  }

  applyPose(pose: CardPose, width: number, height: number) {
    this.face.width = width;
    this.face.height = height;
    this.position.set(pose.x, pose.y);
    this.zIndex = pose.z;

    const scale = Math.max(
      ACE_OF_SHADOWS_CONFIG.cardLabel.minScale,
      width / ACE_OF_SHADOWS_CONFIG.cardLabel.baseWidth,
    );
    const pad = Math.max(
      ACE_OF_SHADOWS_CONFIG.cardLabel.minPadding,
      Math.floor(width * ACE_OF_SHADOWS_CONFIG.cardLabel.paddingFactor),
    );

    this.topRank.scale.set(scale);
    this.bottomRank.scale.set(scale);
    this.topRank.position.set(-width / 2 + pad, -height / 2 + pad);
    this.bottomRank.position.set(width / 2 - pad, height / 2 - pad);
  }

  private static cardRank(index: number): string {
    const { ranks } = ACE_OF_SHADOWS_CONFIG.cardLabel;
    return ranks[index % ranks.length];
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
