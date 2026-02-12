import { Container } from "pixi.js";
import { AceCard } from "./AceCard";
import { AceOfShadowsService } from "../services/AceOfShadowsService";

export class AceOfShadowsBoard extends Container {
  private cards: AceCard[] = [];
  private service: AceOfShadowsService;

  constructor(service: AceOfShadowsService) {
    super();
    this.service = service;
    this.sortableChildren = true;

    for (let i = 0; i < AceOfShadowsService.TOTAL_CARDS; i += 1) {
      const card = new AceCard(i);
      this.cards.push(card);
      this.addChild(card);
    }
  }

  resize(width: number, height: number) {
    this.service.setViewport(width, height);
    this.syncFromService();
  }

  update(deltaMs: number) {
    this.service.tick(deltaMs);
    this.syncFromService();
  }

  destroyBoard() {
    this.cards.forEach((card) => card.destroy({ children: true }));
    this.cards = [];
  }

  private syncFromService() {
    const poses = this.service.getPoses();
    const cardWidth = this.service.getCardWidth();
    const cardHeight = this.service.getCardHeight();

    for (let i = 0; i < this.cards.length; i += 1) {
      const card = this.cards[i];
      const pose = poses[i];
      card.applyPose(pose, cardWidth, cardHeight);
    }
  }
}
