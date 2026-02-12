import { Application, Container, Text, TextStyle } from "pixi.js";
import { SceneManager } from "./SceneManager";

export class Game {
  public app!: Application;
  public stageRoot = new Container();

  private fpsText!: Text;
  private sceneManager!: SceneManager;

  async init(mount: HTMLElement) {
    this.app = new Application();

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

    this.app.ticker.add(() => {
      this.fpsText.text = `FPS: ${this.app.ticker.FPS.toFixed(0)}`;
    });
  }
}
