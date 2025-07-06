import { Deck } from '@prisma/client';

export type TDeckWithSessionAndCategory = Deck & {
  deckSession: {
    totalTime: number;
    updatedAt: Date;
    mastery: number;
  };
  deckCategory: {
    name: string;
    color: string;
    icon: string;
  };
};
