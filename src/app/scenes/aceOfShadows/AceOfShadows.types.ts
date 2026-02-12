export type CardPose = {
  x: number;
  y: number;
  z: number;
};

export type MovingCardState = {
  cardId: number;
  toStack: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startMs: number;
};
