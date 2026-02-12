import { Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { MAGIC_WORDS_CONFIG } from "../MagicWordsConfig";

export type MessageSide = "left" | "right";

type MagicToken =
  | { kind: "text"; value: string }
  | { kind: "emoji"; value: string };

type MessageStyles = {
  nameStyle: TextStyle;
  textStyle: TextStyle;
  fallbackEmojiStyle: TextStyle;
};

type MagicWordsMessageItemOptions = {
  name: string;
  text: string;
  side: MessageSide;
  emojiTexturesByName: Map<string, Texture>;
  avatarTexture?: Texture;
  bubbleMaxWidth: number;
  avatarSize: number;
  outerPad: number;
  bubblePad: number;
  styles: MessageStyles;
};

export class MagicWordsMessageItem extends Container {
  public readonly blockWidth: number;
  public readonly blockHeight: number;

  constructor(options: MagicWordsMessageItemOptions) {
    super();

    const rich = this.createMagicText(options.text, options.bubbleMaxWidth - options.bubblePad * 2, options);
    const nameText = new Text({ text: options.name, style: options.styles.nameStyle });

    const bubbleWidth = Math.max(nameText.width, rich.width) + options.bubblePad * 2;
    const bubbleHeight = nameText.height
      + rich.height
      + options.bubblePad * 2
      + MAGIC_WORDS_CONFIG.message.bubbleGapY;

    const bubbleX = options.side === "left" && options.avatarTexture ? options.avatarSize + options.outerPad : 0;
    const bubble = new Graphics();
    bubble.roundRect(bubbleX, 0, bubbleWidth, bubbleHeight, MAGIC_WORDS_CONFIG.message.bubbleCornerRadius);
    bubble.fill(
      options.side === "right"
        ? MAGIC_WORDS_CONFIG.message.rightBubbleColor
        : MAGIC_WORDS_CONFIG.message.leftBubbleColor,
    );

    nameText.position.set(bubbleX + options.bubblePad, options.bubblePad);
    rich.container.position.set(
      bubbleX + options.bubblePad,
      options.bubblePad + nameText.height + MAGIC_WORDS_CONFIG.message.bubbleGapY,
    );

    this.addChild(bubble, nameText, rich.container);

    if (options.avatarTexture) {
      const avatar = new Sprite(options.avatarTexture);
      avatar.width = options.avatarSize;
      avatar.height = options.avatarSize;

      const avatarX = options.side === "right"
        ? bubbleX + bubbleWidth + options.outerPad
        : 0;

      avatar.position.set(avatarX, bubbleHeight - options.avatarSize);
      this.addChild(avatar);
    }

    this.blockWidth = bubbleWidth + (options.avatarTexture ? options.avatarSize + options.outerPad : 0);
    this.blockHeight = Math.max(bubbleHeight, options.avatarTexture ? options.avatarSize : 0);
  }

  private createMagicText(text: string, maxWidth: number, options: MagicWordsMessageItemOptions) {
    const container = new Container();

    const lineHeight = MAGIC_WORDS_CONFIG.message.lineHeight;
    const emojiSize = MAGIC_WORDS_CONFIG.message.emojiSize;
    let cursorX = 0;
    let cursorY = 0;
    let maxLineWidth = 0;

    const tokens = this.tokenizeMagicText(text);

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];

      if (token.kind === "emoji") {
        const emojiTexture = options.emojiTexturesByName.get(token.value);
        if (!emojiTexture) {
          const fallback = new Text({
            text: `{${token.value}}`,
            style: options.styles.fallbackEmojiStyle,
          });

          if (cursorX > 0 && cursorX + fallback.width > maxWidth) {
            maxLineWidth = Math.max(maxLineWidth, cursorX);
            cursorX = 0;
            cursorY += lineHeight;
          }

          fallback.position.set(cursorX, cursorY);
          container.addChild(fallback);
          cursorX += fallback.width;
          continue;
        }

        const emoji = new Sprite(emojiTexture);
        emoji.width = emojiSize;
        emoji.height = emojiSize;

        if (cursorX > 0 && cursorX + emojiSize > maxWidth) {
          maxLineWidth = Math.max(maxLineWidth, cursorX);
          cursorX = 0;
          cursorY += lineHeight;
        }

        emoji.position.set(cursorX, cursorY + (lineHeight - emojiSize) / 2);
        container.addChild(emoji);
        cursorX += emojiSize + MAGIC_WORDS_CONFIG.message.emojiGapX;
        continue;
      }

      const chunks = token.value.split(/(\s+)/).filter((chunk) => chunk.length > 0);
      for (let j = 0; j < chunks.length; j += 1) {
        const chunk = chunks[j];
        if (chunk.trim().length === 0 && cursorX === 0) {
          continue;
        }

        const chunkText = new Text({ text: chunk, style: options.styles.textStyle });

        if (cursorX > 0 && cursorX + chunkText.width > maxWidth) {
          maxLineWidth = Math.max(maxLineWidth, cursorX);
          cursorX = 0;
          cursorY += lineHeight;
        }

        chunkText.position.set(cursorX, cursorY);
        container.addChild(chunkText);
        cursorX += chunkText.width;
      }
    }

    maxLineWidth = Math.max(maxLineWidth, cursorX);

    return {
      container,
      width: Math.max(MAGIC_WORDS_CONFIG.message.minTextWidth, maxLineWidth),
      height: Math.max(lineHeight, cursorY + lineHeight),
    };
  }

  private tokenizeMagicText(text: string): MagicToken[] {
    const result: MagicToken[] = [];
    const regex = /\{([^}]+)\}/g;

    let lastIndex = 0;
    let match = regex.exec(text);

    while (match) {
      const index = match.index;
      if (index > lastIndex) {
        result.push({ kind: "text", value: text.slice(lastIndex, index) });
      }

      result.push({ kind: "emoji", value: match[1].trim() });
      lastIndex = regex.lastIndex;
      match = regex.exec(text);
    }

    if (lastIndex < text.length) {
      result.push({ kind: "text", value: text.slice(lastIndex) });
    }

    return result;
  }
}
