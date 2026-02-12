import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { PhoenixFlameService } from "../services/PhoenixFlameService";

export class PhoenixFlameField extends Container {
  private static readonly GLOW_RADII = [56, 32, 18] as const;
  private static readonly GLOW_Y_OFFSETS = [12, 2, -8] as const;
  private static readonly GLOW_COLORS = [0xff3b0a, 0xff7a1c, 0xffc94a] as const;
  private static readonly GLOW_ALPHAS = [0.22, 0.26, 0.32] as const;

  private flameLayer = new Container();
  private coreGlow = new Container();
  private glowRings: Graphics[] = [];
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

    for (let i = 0; i < PhoenixFlameField.GLOW_RADII.length; i += 1) {
      const glow = new Graphics();
      glow.circle(0, 0, PhoenixFlameField.GLOW_RADII[i]);
      glow.fill({
        color: PhoenixFlameField.GLOW_COLORS[i],
        alpha: PhoenixFlameField.GLOW_ALPHAS[i],
      });
      this.glowRings.push(glow);
      this.coreGlow.addChild(glow);
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
    this.glowRings.forEach((glow) => glow.destroy());
    this.glowRings = [];
    this.coreGlow.destroy({ children: true });
  }

  private drawCoreGlow() {
    const emitterX = this.service.getEmitterX();
    const emitterY = this.service.getEmitterY();
    const pulse = this.service.getPulse();

    for (let i = 0; i < this.glowRings.length; i += 1) {
      const glow = this.glowRings[i];
      glow.position.set(emitterX, emitterY + PhoenixFlameField.GLOW_Y_OFFSETS[i]);
      glow.scale.set(pulse);
    }
  }
}
