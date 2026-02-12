import { Container } from "pixi.js";

export type SceneOrientation = "portrait" | "landscape";

export interface IScene {
  readonly view: Container;
  onResize(width: number, height: number): void;
  onOrientationChange?(orientation: SceneOrientation): void;
  destroy(): void;
}
