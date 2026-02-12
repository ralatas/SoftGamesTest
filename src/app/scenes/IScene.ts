import { Container } from "pixi.js";

export interface IScene {
  readonly view: Container;
  onResize(width: number, height: number): void;
  destroy(): void;
}
