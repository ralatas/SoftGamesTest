import { PHOENIX_FLAME_CONFIG } from "../PhoenixFlameConfig";
import type { FlameParticleState } from "../PhoenixFlame.types";

export class PhoenixFlameService {
  static readonly MAX_PARTICLES = PHOENIX_FLAME_CONFIG.maxParticles;

  private particles: FlameParticleState[] = [];
  private emitterX = 0;
  private emitterY = 0;
  private elapsedMs = 0;
  private spawnAccumulatorMs = 0;
  private spawnSearchStart = 0;

  constructor() {
    this.particles = Array.from(
      { length: PhoenixFlameService.MAX_PARTICLES },
      () => ({ ...PHOENIX_FLAME_CONFIG.particleDefaults }),
    );
  }

  setEmitter(x: number, y: number) {
    this.emitterX = x;
    this.emitterY = y;
  }

  tick(deltaMs: number) {
    this.elapsedMs += deltaMs;
    this.spawnAccumulatorMs += deltaMs;

    while (this.spawnAccumulatorMs >= PHOENIX_FLAME_CONFIG.spawnIntervalMs) {
      this.spawnAccumulatorMs -= PHOENIX_FLAME_CONFIG.spawnIntervalMs;
      this.spawnParticle();
    }

    this.updateParticles(deltaMs);
  }

  getParticles(): FlameParticleState[] {
    return this.particles;
  }

  getEmitterX(): number {
    return this.emitterX;
  }

  getEmitterY(): number {
    return this.emitterY;
  }

  getPulse(): number {
    return 0.9 + Math.sin(this.elapsedMs * 0.02) * 0.14;
  }

  private spawnParticle() {
    let particle: FlameParticleState | undefined;
    const count = this.particles.length;
    for (let i = 0; i < count; i += 1) {
      const index = (this.spawnSearchStart + i) % count;
      const candidate = this.particles[index];
      if (!candidate.active) {
        particle = candidate;
        this.spawnSearchStart = (index + 1) % count;
        break;
      }
    }

    if (!particle) {
      return;
    }

    particle.active = true;
    particle.spark = Math.random() < PHOENIX_FLAME_CONFIG.sparkChance;
    particle.ageMs = 0;
    const preset = particle.spark ? PHOENIX_FLAME_CONFIG.spawn.spark : PHOENIX_FLAME_CONFIG.spawn.flame;
    particle.lifeMs = this.randomRange(...preset.lifeMs);
    particle.vx = this.randomRange(...preset.vx);
    particle.vy = this.randomRange(...preset.vy);
    particle.startSize = this.randomRange(...preset.startSize);
    particle.endSize = this.randomRange(...preset.endSize);
    particle.spin = this.randomRange(...PHOENIX_FLAME_CONFIG.spawn.spin);

    particle.rotation = this.randomRange(...PHOENIX_FLAME_CONFIG.spawn.rotation);
    particle.x = this.emitterX + this.randomRange(...PHOENIX_FLAME_CONFIG.spawnOffset.x);
    particle.y = this.emitterY + this.randomRange(...PHOENIX_FLAME_CONFIG.spawnOffset.y);
    particle.z = PHOENIX_FLAME_CONFIG.render.initialZ;
    particle.alpha = PHOENIX_FLAME_CONFIG.render.initialAlpha;
    particle.tint = PHOENIX_FLAME_CONFIG.render.initialTint;
  }

  private updateParticles(dtMs: number) {
    const updateCfg = PHOENIX_FLAME_CONFIG.update;
    const alphaCfg = updateCfg.alpha;
    const initialZ = PHOENIX_FLAME_CONFIG.render.initialZ;
    const zRange = PHOENIX_FLAME_CONFIG.render.zRange;

    for (let i = 0; i < this.particles.length; i += 1) {
      const particle = this.particles[i];
      if (!particle.active) {
        continue;
      }

      particle.ageMs += dtMs;
      const t = particle.ageMs / particle.lifeMs;
      if (t >= 1) {
        particle.active = false;
        particle.rotation = 0;
        particle.alpha = 0;
        continue;
      }

      const dtSec = dtMs / 1000;
      const chaos = this.randomRange(-1, 1) * (
        particle.spark ? updateCfg.sparkChaos : updateCfg.flameChaos
      );
      particle.vx += chaos * dtSec;
      particle.vx *= particle.spark ? updateCfg.sparkDrag : updateCfg.flameDrag;
      particle.vy -= (
        particle.spark ? updateCfg.sparkLift : updateCfg.flameLift
      ) * (dtMs / updateCfg.frameMs);

      particle.x += particle.vx * dtSec;
      particle.y += particle.vy * dtSec;
      particle.rotation += particle.spin * dtSec;

      const size = this.lerp(particle.startSize, particle.endSize, t);
      particle.width = size;
      particle.height = size * (
        particle.spark
          ? updateCfg.sparkHeightScale
          : updateCfg.flameHeightScale
      );

      particle.alpha = this.alphaAt(t, particle.spark, alphaCfg);
      particle.tint = this.colorAt(t);
      particle.z = initialZ + Math.round((1 - t) * zRange);
    }
  }

  private alphaAt(
    t: number,
    spark: boolean,
    alphaCfg: typeof PHOENIX_FLAME_CONFIG.update.alpha,
  ): number {
    const fadeIn = Math.min(1, t * (spark ? alphaCfg.sparkFadeIn : alphaCfg.flameFadeIn));
    const fadeOut = Math.max(0, 1 - t * (spark ? alphaCfg.sparkFadeOut : alphaCfg.flameFadeOut));
    return fadeIn * fadeOut;
  }

  private colorAt(t: number): number {
    for (let i = 0; i < PHOENIX_FLAME_CONFIG.render.colorStops.length; i += 1) {
      const stop = PHOENIX_FLAME_CONFIG.render.colorStops[i];
      if (t < stop.maxT) {
        return stop.color;
      }
    }
    return PHOENIX_FLAME_CONFIG.render.colorStops[PHOENIX_FLAME_CONFIG.render.colorStops.length - 1].color;
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
