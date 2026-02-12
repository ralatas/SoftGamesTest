import { Container, Graphics, Text, TextStyle } from "pixi.js";

type ButtonOptions = {
  label: string;
  width?: number;
  height?: number;
  onClick: () => void;
};

export class Button extends Container {
  private bg = new Graphics();
  private text: Text;

  private w: number;
  private h: number;

  constructor(opts: ButtonOptions) {
    super();

    this.w = opts.width ?? 260;
    this.h = opts.height ?? 48;

    this.text = new Text({
      text: opts.label,
      style: new TextStyle({ fill: "#ffffff", fontSize: 16 }),
    });

    this.addChild(this.bg, this.text);
    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointertap", opts.onClick);
    this.on("pointerover", () => this.draw(true));
    this.on("pointerout", () => this.draw(false));

    this.draw(false);
  }

  private draw(hover: boolean) {
    this.bg.clear();
    this.bg.roundRect(0, 0, this.w, this.h, 12);
    this.bg.fill(hover ? 0x3340aa : 0x222a66);

    this.text.anchor.set(0.5);
    this.text.position.set(this.w / 2, this.h / 2);
  }
}
