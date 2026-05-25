import { Application, Container, Text, TextStyle } from "pixi.js";
import { SceneManager } from "./SceneManager";
import { initDevtools } from '@pixi/devtools';

export class Game {
  public app!: Application;
  public stageRoot = new Container();

  private fpsText!: Text;
  private sceneManager!: SceneManager;
  private fpsUpdateIntervalMs = 250;
  private fpsElapsedMs = 0;

  private readonly onTick = () => {
    this.fpsElapsedMs += this.app.ticker.deltaMS;
    if (this.fpsElapsedMs < this.fpsUpdateIntervalMs) {
      return;
    }
    this.fpsElapsedMs = 0;
    this.fpsText.text = `FPS: ${this.app.ticker.FPS.toFixed(0)}`;
  };

  async init(mount: HTMLElement) {
    this.app = new Application();
    initDevtools({
      app: this.app,
      // If you are not using a pixi app, you can pass the renderer and stage directly
      // renderer: myRenderer,
      // stage: myStage,
    });
    await this.app.init({
      background: "#0b0f1a",
      antialias: true,
      resizeTo: window,
      eventMode: "passive",
    });

    mount.appendChild(this.app.canvas);
    this.app.stage.addChild(this.stageRoot);

    this.fpsText = new Text({
      text: "FPS: --",
      style: new TextStyle({ fill: "#ffffff", fontSize: 14 }),
    });
    this.fpsText.position.set(10, 8);
    this.fpsText.zIndex = 999999;
    this.stageRoot.addChild(this.fpsText);

    this.sceneManager = new SceneManager(this.stageRoot, this.app);
    this.sceneManager.goToMenu();

    this.app.ticker.add(this.onTick);
  }

  destroy() {
    this.app.ticker.remove(this.onTick);
    this.sceneManager.destroy();
    this.app.destroy(true, { children: true });
  }
}
