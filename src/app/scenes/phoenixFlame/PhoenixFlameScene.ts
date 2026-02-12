import { Container, Text, TextStyle, Ticker } from "pixi.js";
import type { IScene } from "../IScene";
import { Button } from "../../../ui/Button";
import { PhoenixFlameService } from "./services/PhoenixFlameService";
import { PhoenixFlameField } from "./components/PhoenixFlameField";

export class PhoenixFlameScene implements IScene {
  public view = new Container();

  private title: Text;
  private subtitle: Text;
  private back: Button;
  private service: PhoenixFlameService;
  private field: PhoenixFlameField;

  constructor(deps: { onBack: () => void }) {
    this.title = new Text({
      text: "Phoenix Flame",
      style: new TextStyle({ fill: "#ffffff", fontSize: 26 }),
    });
    this.subtitle = new Text({
      text: "Raging fire demo (max 10 sprites)",
      style: new TextStyle({ fill: "#ffc17a", fontSize: 16 }),
    });
    this.back = new Button({ label: "<- Back", width: 120, onClick: deps.onBack });

    this.service = new PhoenixFlameService();
    this.field = new PhoenixFlameField(this.service);

    this.view.sortableChildren = true;
    this.view.addChild(this.title, this.subtitle, this.back, this.field);

    Ticker.shared.add(this.update);
  }

  onResize(width: number, height: number) {
    this.title.anchor.set(0.5, 0);
    this.title.position.set(width / 2, 16);

    this.subtitle.anchor.set(0.5, 0);
    this.subtitle.position.set(width / 2, 50);

    this.back.position.set(16, 48);
    this.field.resize(width, height);
  }

  destroy() {
    Ticker.shared.remove(this.update);
    this.view.removeChildren();
    this.title.destroy();
    this.subtitle.destroy();
    this.back.destroy({ children: true });
    this.field.destroyField();
  }

  private update = (ticker: Ticker) => {
    this.field.update(ticker.deltaMS);
  };
}
