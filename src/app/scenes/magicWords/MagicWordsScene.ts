import { Container, Text, TextStyle } from "pixi.js";
import type { IScene } from "../IScene";
import { Button } from "../../../ui/Button";
import { MagicWordsService } from "./services/MagicWordsService";
import { MagicWordsDialoguePanel } from "./components/MagicWordsDialoguePanel";
import { MAGIC_WORDS_CONFIG } from "./MagicWordsConfig";

export class MagicWordsScene implements IScene {
  public view = new Container();

  private back: Button;
  private title: Text;
  private status: Text;
  private dialoguePanel: MagicWordsDialoguePanel;
  private service: MagicWordsService;
  private destroyed = false;

  constructor(deps: { onBack: () => void }) {
    this.title = new Text({
      text: "Magic Words",
      style: new TextStyle({
        fill: "#ffffff",
        fontSize: MAGIC_WORDS_CONFIG.scene.titleFontSize,
      }),
    });
    this.status = new Text({
      text: "Loading dialogue...",
      style: new TextStyle({
        fill: "#9ba6d6",
        fontSize: MAGIC_WORDS_CONFIG.scene.statusFontSize,
      }),
    });
    this.back = new Button({
      label: "<- Back",
      width: MAGIC_WORDS_CONFIG.scene.backButtonWidth,
      onClick: deps.onBack,
    });

    this.dialoguePanel = new MagicWordsDialoguePanel();
    this.service = new MagicWordsService();

    this.view.addChild(this.title, this.back, this.status, this.dialoguePanel);
    window.addEventListener("wheel", this.onWheel, { passive: true });

    void this.loadDialogue();
  }

  onResize(width: number, height: number) {
    this.title.anchor.set(MAGIC_WORDS_CONFIG.scene.titleAnchorX, 0);
    this.title.position.set(width / 2, MAGIC_WORDS_CONFIG.scene.titleTop);
    this.back.position.set(
      MAGIC_WORDS_CONFIG.scene.backButtonX,
      MAGIC_WORDS_CONFIG.scene.backButtonY,
    );

    const contentX = MAGIC_WORDS_CONFIG.scene.contentX;
    const contentY = MAGIC_WORDS_CONFIG.scene.contentY;
    const contentWidth = Math.max(
      MAGIC_WORDS_CONFIG.scene.minContentWidth,
      width - MAGIC_WORDS_CONFIG.scene.contentHorizontalPadding,
    );
    const contentHeight = Math.max(
      MAGIC_WORDS_CONFIG.scene.minContentHeight,
      height - contentY - MAGIC_WORDS_CONFIG.scene.contentBottomPadding,
    );

    this.status.position.set(contentX, contentY + MAGIC_WORDS_CONFIG.scene.statusOffsetY);
    this.dialoguePanel.setLayout(contentX, contentY, contentWidth, contentHeight);
  }

  destroy() {
    this.destroyed = true;
    window.removeEventListener("wheel", this.onWheel);
    this.view.removeChildren();
    this.back.destroy({ children: true });
    this.title.destroy();
    this.status.destroy();
    this.dialoguePanel.destroy({ children: true });
  }

  private async loadDialogue() {
    try {
      const resources = await this.service.load();
      if (this.destroyed) {
        return;
      }

      this.status.text = "";
      this.dialoguePanel.renderDialogue(resources);
    } catch {
      if (this.destroyed) {
        return;
      }
      this.status.text = "Failed to load magic words data.";
      this.dialoguePanel.clearDialogue();
    }
  }

  private onWheel = (event: WheelEvent) => {
    this.dialoguePanel.onWheel(event.deltaY);
  };
}
