import { Application, Container } from "pixi.js";
import type { IScene } from "./scenes/IScene";
import { MenuScene } from "./scenes/MenuScene";
import { AceOfShadowsScene } from "./scenes/aceOfShadows/AceOfShadowsScene";
import { MagicWordsScene } from "./scenes/magicWords/MagicWordsScene";
import { PhoenixFlameScene } from "./scenes/phoenixFlame/PhoenixFlameScene";

export class SceneManager {
  private current?: IScene;
  private root: Container;
  private app: Application;

  constructor(root: Container, app: Application) {
    this.root = root;
    this.app = app;
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  }

  goToMenu() {
    this.setScene(new MenuScene({
      app: this.app,
      onSelect: (id) => {
        if (id === "ace") this.goToAce();
        if (id === "magic") this.goToMagic();
        if (id === "phoenix") this.goToPhoenix();
      },
    }));
  }

  goToAce() {
    this.setScene(new AceOfShadowsScene({ onBack: () => this.goToMenu() }));
  }

  goToMagic() {
    this.setScene(new MagicWordsScene({ onBack: () => this.goToMenu() }));
  }

  goToPhoenix() {
    this.setScene(new PhoenixFlameScene({ onBack: () => this.goToMenu() }));
  }

  private setScene(scene: IScene) {
    if (this.current) {
      this.root.removeChild(this.current.view);
      this.current.destroy();
    }
    this.current = scene;
    this.root.addChild(scene.view);
    this.handleResize();
  }

  private handleResize = () => {
    const w = this.app.renderer.width;
    const h = this.app.renderer.height;
    this.current?.onResize(w, h);
  };
}
