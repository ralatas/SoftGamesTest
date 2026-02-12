import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { PhoenixFlameService } from "../services/PhoenixFlameService";

export class PhoenixFlameField extends Container {
  private flameLayer = new Container();
  private coreGlow = new Graphics();
  private particleSprites: Sprite[] = [];
  private service: PhoenixFlameService;

  constructor(service: PhoenixFlameService) {
    super();
    this.service = service;

    this.sortableChildren = true;
    this.flameLayer.sortableChildren = true;

    for (let i = 0; i < PhoenixFlameService.MAX_PARTICLES; i += 1) {
      const sprite = new Sprite(Texture.WHITE);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      this.particleSprites.push(sprite);
      this.flameLayer.addChild(sprite);
    }

    this.addChild(this.coreGlow, this.flameLayer);
  }

  resize(width: number, height: number) {
    this.service.setEmitter(width / 2, height * 0.82);
    this.drawCoreGlow();
  }

  update(deltaMs: number) {
    this.service.tick(deltaMs);

    const particles = this.service.getParticles();
    for (let i = 0; i < this.particleSprites.length; i += 1) {
      const sprite = this.particleSprites[i];
      const particle = particles[i];

      if (sprite.visible !== particle.active) {
        sprite.visible = particle.active;
      }
      if (!particle.active) {
        continue;
      }

      sprite.position.set(particle.x, particle.y);
      sprite.rotation = particle.rotation;
      sprite.width = particle.width;
      sprite.height = particle.height;
      sprite.alpha = particle.alpha;
      sprite.tint = particle.tint;
      sprite.zIndex = particle.z;
    }

    this.drawCoreGlow();
  }

  destroyField() {
    this.particleSprites.forEach((sprite) => sprite.destroy());
    this.particleSprites = [];
    this.coreGlow.destroy();
  }

  private drawCoreGlow() {
    const emitterX = this.service.getEmitterX();
    const emitterY = this.service.getEmitterY();
    const pulse = this.service.getPulse();

    this.coreGlow.clear();
    this.coreGlow.circle(emitterX, emitterY + 12, 56 * pulse);
    this.coreGlow.fill({ color: 0xff3b0a, alpha: 0.22 });

    this.coreGlow.circle(emitterX, emitterY + 2, 32 * pulse);
    this.coreGlow.fill({ color: 0xff7a1c, alpha: 0.26 });

    this.coreGlow.circle(emitterX, emitterY - 8, 18 * pulse);
    this.coreGlow.fill({ color: 0xffc94a, alpha: 0.32 });
  }
}
