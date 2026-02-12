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
  private fullscreenButton: Button;
  private readonly onFullscreenChange = () => this.updateFullscreenButtonLabel();

  constructor(deps: MenuSceneDeps) {
    this.title = new Text({
      text: "Game Developer Assignment (Pixi v8)",
      style: new TextStyle({ fill: "#ffffff", fontSize: 20 }),
    });

    const c1 = new Button({
      label: "1) Ace of Shadows",
      onClick: () => deps.onSelect("ace"),
      normalColor: 0xe53935,
      hoverColor: 0xff6f60,
    });
    const c2 = new Button({
      label: "2) Magic Words",
      onClick: () => deps.onSelect("magic"),
      normalColor: 0xfb8c00,
      hoverColor: 0xffb74d,
    });
    const c3 = new Button({
      label: "3) Phoenix Flame",
      onClick: () => deps.onSelect("phoenix"),
      normalColor: 0x43a047,
      hoverColor: 0x81c784,
    });
    this.fullscreenButton = new Button({
      label: "Enter Fullscreen",
      onClick: async () => {
        const el = document.documentElement as any;
        if (document.fullscreenElement) {
          await document.exitFullscreen?.();
        } else {
          await el.requestFullscreen?.();
        }
      },
      normalColor: 0x8e24aa,
      hoverColor: 0xba68c8,
    });

    this.buttons = [c1, c2, c3, this.fullscreenButton];
    this.view.addChild(this.title, ...this.buttons);
    document.addEventListener("fullscreenchange", this.onFullscreenChange);
    this.updateFullscreenButtonLabel();
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
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
    this.view.removeChildren();
    this.buttons.forEach((b) => b.destroy({ children: true }));
    this.title.destroy();
  }

  private updateFullscreenButtonLabel() {
    this.fullscreenButton.setLabel(
      document.fullscreenElement ? "Exit Fullscreen" : "Enter Fullscreen",
    );
  }
}
