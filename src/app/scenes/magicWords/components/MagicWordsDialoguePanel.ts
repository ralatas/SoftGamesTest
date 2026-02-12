import { Container, TextStyle } from "pixi.js";
import { MagicWordsMessageItem } from "./MagicWordsMessageItem";
import { MagicWordsScrollView } from "./MagicWordsScrollView";
import type { MagicWordsResources } from "../MagicWords.types";
import { MAGIC_WORDS_CONFIG } from "../MagicWordsConfig";

export class MagicWordsDialoguePanel extends Container {
  private scrollView = new MagicWordsScrollView();
  private resources?: MagicWordsResources;
  private compactMode = false;

  private nameStyle = new TextStyle({
    fill: MAGIC_WORDS_CONFIG.message.nameColor,
    fontSize: MAGIC_WORDS_CONFIG.message.nameFontSize,
    fontWeight: "700",
  });
  private textStyle = new TextStyle({
    fill: MAGIC_WORDS_CONFIG.message.textColor,
    fontSize: MAGIC_WORDS_CONFIG.message.textFontSize,
    wordWrap: false,
  });
  private fallbackEmojiStyle = new TextStyle({
    fill: MAGIC_WORDS_CONFIG.message.fallbackEmojiColor,
    fontSize: MAGIC_WORDS_CONFIG.message.fallbackEmojiFontSize,
  });

  constructor() {
    super();
    this.addChild(this.scrollView);
  }

  setCompactMode(compact: boolean) {
    if (this.compactMode === compact) {
      return;
    }
    this.compactMode = compact;
    this.nameStyle.fontSize = compact
      ? MAGIC_WORDS_CONFIG.message.nameFontSizeCompact
      : MAGIC_WORDS_CONFIG.message.nameFontSize;
    this.textStyle.fontSize = compact
      ? MAGIC_WORDS_CONFIG.message.textFontSizeCompact
      : MAGIC_WORDS_CONFIG.message.textFontSize;
    this.fallbackEmojiStyle.fontSize = compact
      ? MAGIC_WORDS_CONFIG.message.fallbackEmojiFontSizeCompact
      : MAGIC_WORDS_CONFIG.message.fallbackEmojiFontSize;

    if (this.resources) {
      this.renderDialogue(this.resources);
    }
  }

  setLayout(x: number, y: number, width: number, height: number) {
    this.scrollView.setLayout(x, y, width, height);
    if (this.resources) {
      this.renderDialogue(this.resources);
    }
  }

  renderDialogue(resources: MagicWordsResources) {
    this.resources = resources;
    this.scrollView.clearContent();

    const avatarByName = new Map<string, { position: "left" | "right" }>();
    for (let i = 0; i < resources.payload.avatars.length; i += 1) {
      const avatar = resources.payload.avatars[i];
      avatarByName.set(avatar.name, { position: avatar.position });
    }

    const avatarSize = MAGIC_WORDS_CONFIG.message.avatarSize;
    const outerPad = MAGIC_WORDS_CONFIG.panel.outerPad;
    const bubblePad = MAGIC_WORDS_CONFIG.message.bubblePad;
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
