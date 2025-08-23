import { Card, FSRSCard } from '@prisma/client';

export type TCardWithFSRSCard = Card & {
  fsrsCard: FSRSCard;
};

export type TFSRSCardWithCard = FSRSCard & {
  card: Card;
};
