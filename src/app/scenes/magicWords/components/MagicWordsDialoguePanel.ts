import { Container, TextStyle } from "pixi.js";
import { MagicWordsMessageItem } from "./MagicWordsMessageItem";
import { MagicWordsScrollView } from "./MagicWordsScrollView";
import type { MagicWordsResources } from "../MagicWords.types";
import { MAGIC_WORDS_CONFIG } from "../MagicWordsConfig";

export class MagicWordsDialoguePanel extends Container {
  private scrollView = new MagicWordsScrollView();

  private nameStyle = new TextStyle({
    fill: "#ffffff",
    fontSize: MAGIC_WORDS_CONFIG.panel.nameFontSize,
    fontWeight: "700",
  });
  private textStyle = new TextStyle({
    fill: "#d8deff",
    fontSize: MAGIC_WORDS_CONFIG.panel.textFontSize,
    wordWrap: false,
  });
  private fallbackEmojiStyle = new TextStyle({
    fill: "#ffd36b",
    fontSize: MAGIC_WORDS_CONFIG.panel.fallbackEmojiFontSize,
  });

  constructor() {
    super();
    this.addChild(this.scrollView);
  }

  setLayout(x: number, y: number, width: number, height: number) {
    this.scrollView.setLayout(x, y, width, height);
  }

  renderDialogue(resources: MagicWordsResources) {
    this.scrollView.clearContent();

    const avatarByName = new Map<string, { position: "left" | "right" }>();
    for (let i = 0; i < resources.payload.avatars.length; i += 1) {
      const avatar = resources.payload.avatars[i];
      avatarByName.set(avatar.name, { position: avatar.position });
    }

    const avatarSize = MAGIC_WORDS_CONFIG.panel.avatarSize;
    const outerPad = MAGIC_WORDS_CONFIG.panel.outerPad;
    const bubblePad = MAGIC_WORDS_CONFIG.panel.bubblePad;
    const viewportWidth = this.scrollView.getViewportWidth();
    const bubbleMaxWidth = Math.min(
      MAGIC_WORDS_CONFIG.panel.bubbleMaxWidth,
      viewportWidth - avatarSize - outerPad * 4 - MAGIC_WORDS_CONFIG.panel.bubbleWidthSafetyPadding,
    );

    let cursorY = MAGIC_WORDS_CONFIG.panel.contentTopPad;

    for (let i = 0; i < resources.payload.dialogue.length; i += 1) {
      const line = resources.payload.dialogue[i];
      const side = avatarByName.get(line.name)?.position ?? "left";
      const avatarTexture = resources.avatarTexturesByName.get(line.name);

      const message = new MagicWordsMessageItem({
        name: line.name,
        text: line.text,
        side,
        emojiTexturesByName: resources.emojiTexturesByName,
        avatarTexture,
        bubbleMaxWidth,
        avatarSize,
        outerPad,
        bubblePad,
        styles: {
          nameStyle: this.nameStyle,
          textStyle: this.textStyle,
          fallbackEmojiStyle: this.fallbackEmojiStyle,
        },
      });

      const leftX = outerPad;
      const rightX = viewportWidth - outerPad - message.blockWidth;
      message.position.set(side === "right" ? rightX : leftX, cursorY);

      this.scrollView.contentRoot.addChild(message);
      cursorY += message.blockHeight + MAGIC_WORDS_CONFIG.panel.rowGap;
    }

    this.scrollView.setContentHeight(cursorY + MAGIC_WORDS_CONFIG.panel.contentBottomPad, true);
  }

  clearDialogue() {
    this.scrollView.clearContent();
  }

  onWheel(deltaY: number) {
    this.scrollView.onWheel(deltaY);
  }
}
