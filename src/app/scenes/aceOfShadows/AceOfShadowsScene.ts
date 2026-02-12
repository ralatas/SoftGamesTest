import { Container, Text, TextStyle, Ticker } from "pixi.js";
import type { IScene } from "../IScene";
import { Button } from "../../../ui/Button";
import { AceOfShadowsService } from "./services/AceOfShadowsService";
import { AceOfShadowsBoard } from "./components/AceOfShadowsBoard";
import { ACE_OF_SHADOWS_CONFIG } from "./AceOfShadowsConfig";

export class AceOfShadowsScene implements IScene {
  public view = new Container();

  private title: Text;
  private back: Button;
  private board: AceOfShadowsBoard;
  private service: AceOfShadowsService;

  constructor(deps: { onBack: () => void }) {
    this.title = new Text({
      text: "Ace of Shadows",
      style: new TextStyle({
        fill: "#ffffff",
        fontSize: ACE_OF_SHADOWS_CONFIG.scene.titleFontSize,
      }),
    });
    this.back = new Button({
      label: "<- Back",
      width: ACE_OF_SHADOWS_CONFIG.scene.backButtonWidth,
      onClick: deps.onBack,
    });

    this.service = new AceOfShadowsService();
    this.board = new AceOfShadowsBoard(this.service);

    this.view.sortableChildren = true;
    this.view.addChild(this.title, this.back, this.board);

    Ticker.shared.add(this.update);
  }

  onResize(width: number, height: number) {
    this.title.anchor.set(ACE_OF_SHADOWS_CONFIG.scene.titleAnchorX, 0);
    this.title.position.set(width / 2, ACE_OF_SHADOWS_CONFIG.scene.titleTop);
    this.back.position.set(
      ACE_OF_SHADOWS_CONFIG.scene.backButtonX,
      ACE_OF_SHADOWS_CONFIG.scene.backButtonY,
    );
    this.board.resize(width, height);
  }

  destroy() {
    Ticker.shared.remove(this.update);
    this.view.removeChildren();
    this.title.destroy();
    this.back.destroy({ children: true });
    this.board.destroyBoard();
  }

  private update = (ticker: Ticker) => {
    this.board.update(ticker.deltaMS);
  };
}
