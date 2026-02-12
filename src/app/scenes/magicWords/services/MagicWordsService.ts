import { Texture } from "pixi.js";
import type {
  MagicWordsApiResponse,
  MagicWordsAvatarItem,
  MagicWordsEmojiItem,
  MagicWordsPayload,
  MagicWordsResources,
} from "../MagicWords.types";

export class MagicWordsService {
  private static readonly ENDPOINT = "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords";
  private static readonly textureByUrl = new Map<string, Promise<Texture | undefined>>();

  async load(): Promise<MagicWordsResources> {
    const response = await fetch(MagicWordsService.ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const raw = (await response.json()) as unknown;
    const payload = this.normalizePayload(raw);

    const emojiTexturesByName = new Map<string, Texture>();
    const avatarTexturesByName = new Map<string, Texture>();

    for (let i = 0; i < payload.emojis.length; i += 1) {
      const emoji = payload.emojis[i];
      const texture = await this.loadTexture(emoji.url);
      if (texture) {
        emojiTexturesByName.set(emoji.name, texture);
      }
    }

    for (let i = 0; i < payload.avatars.length; i += 1) {
      const avatar = payload.avatars[i];
      const texture = await this.loadTexture(avatar.url);
      if (texture) {
        avatarTexturesByName.set(avatar.name, texture);
      }
    }

    return { payload, emojiTexturesByName, avatarTexturesByName };
  }

  private normalizePayload(raw: unknown): MagicWordsPayload {
    const base = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

    const dialogue = Array.isArray(base.dialogue)
      ? base.dialogue
          .map((item) => {
            const entry = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
            const name = typeof entry.name === "string" ? entry.name : "Unknown";
            const text = typeof entry.text === "string" ? entry.text : "";
            return { name, text };
          })
          .filter((entry) => entry.text.length > 0)
      : [];

    const apiBase = base as Partial<MagicWordsApiResponse> & Record<string, unknown>;
    const rawEmojis = Array.isArray(apiBase.emojies)
      ? apiBase.emojies
      : Array.isArray(base.emojis)
        ? base.emojis
        : [];

    const emojis = rawEmojis
      .map((item) => this.normalizeEmoji(item))
      .filter((entry) => entry.name.length > 0 && entry.url.length > 0);

    const avatars = Array.isArray(base.avatars)
      ? base.avatars
          .map((item) => this.normalizeAvatar(item))
          .filter((entry) => entry.name.length > 0 && entry.url.length > 0)
      : [];

    return { dialogue, emojis, avatars };
  }

  private normalizeEmoji(item: unknown): MagicWordsEmojiItem {
    const entry = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    const name = typeof entry.name === "string" ? entry.name : "";
    const url = typeof entry.url === "string" ? entry.url : "";
    return { name, url };
  }

  private normalizeAvatar(item: unknown): MagicWordsAvatarItem {
    const entry = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    const name = typeof entry.name === "string" ? entry.name : "";
    const url = typeof entry.url === "string" ? entry.url : "";
    const position: "left" | "right" = entry.position === "right" ? "right" : "left";
    return { name, url, position };
  }

  private async loadTexture(url: string): Promise<Texture | undefined> {
    const cached = MagicWordsService.textureByUrl.get(url);
    if (cached) {
      return cached;
    }

    const pending = new Promise<Texture | undefined>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          resolve(Texture.from(img));
        } catch {
          resolve(undefined);
        }
      };
      img.onerror = () => resolve(undefined);
      img.src = url;
    });

    MagicWordsService.textureByUrl.set(url, pending);
    return pending;
  }
}
