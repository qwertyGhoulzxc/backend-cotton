import { TCardWithFSRSCard } from '@app/@types';
import { Card } from '@prisma/client';

export function cardWithoutPlain(card: TCardWithFSRSCard | Card) {
  const { plainAnswer, plainQuestion, ...etc } = card;
  return etc;
}
