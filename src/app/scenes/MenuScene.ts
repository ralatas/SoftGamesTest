import { Application, Container, Text, TextStyle } from "pixi.js";
import type { IScene } from "./IScene";
import { Button } from "../../ui/Button";

type MenuSceneDeps = {
  app: Application;
  onSelect: (id: "ace" | "magic" | "phoenix") => void;
};

export class MenuScene implements IScene {
  public view = new Container();

  private title: Text;
  private buttons: Button[] = [];

  constructor(deps: MenuSceneDeps) {
    this.title = new Text({
      text: "Game Developer Assignment (Pixi v8)",
      style: new TextStyle({ fill: "#ffffff", fontSize: 20 }),
    });

    const b1 = new Button({ label: "1) Ace of Shadows", onClick: () => deps.onSelect("ace") });
    const b2 = new Button({ label: "2) Magic Words", onClick: () => deps.onSelect("magic") });
    const b3 = new Button({ label: "3) Phoenix Flame", onClick: () => deps.onSelect("phoenix") });

    const fs = new Button({
      label: "Enter Fullscreen",
      onClick: async () => {
        const el = document.documentElement as any;
        if (document.fullscreenElement) {
          await document.exitFullscreen?.();
        } else {
          await el.requestFullscreen?.();
        }
      },
    });

    this.buttons = [b1, b2, b3, fs];
    this.view.addChild(this.title, ...this.buttons);
  }

  onResize(width: number, height: number) {
    this.title.anchor.set(0.5, 0);
    this.title.position.set(width / 2, 24);

    const startY = Math.round(height * 0.28);
    const gap = 14;

    this.buttons.forEach((b, i) => {
      b.position.set(Math.round(width / 2 - 130), startY + i * (48 + gap));
    });
  }

  destroy() {
    this.view.removeChildren();
    this.buttons.forEach((b) => b.destroy({ children: true }));
    this.title.destroy();
  }
}
