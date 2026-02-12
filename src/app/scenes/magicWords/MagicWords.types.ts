export interface MagicWordsDialogueItem {
  name: string;
  text: string;
}

export interface MagicWordsEmojiItem {
  name: string;
  url: string;
}

export interface MagicWordsAvatarItem {
  name: string;
  url: string;
  position: "left" | "right";
}

export interface MagicWordsApiResponse {
  dialogue: MagicWordsDialogueItem[];
  emojies: MagicWordsEmojiItem[];
  avatars: MagicWordsAvatarItem[];
}

export interface MagicWordsPayload {
  dialogue: MagicWordsDialogueItem[];
  emojis: MagicWordsEmojiItem[];
  avatars: MagicWordsAvatarItem[];
}

export interface MagicWordsResources {
  payload: MagicWordsPayload;
  emojiTexturesByName: Map<string, import("pixi.js").Texture>;
  avatarTexturesByName: Map<string, import("pixi.js").Texture>;
}
