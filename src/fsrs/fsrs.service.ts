import { TFSRSCardWithCard } from '@app/@types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Deck } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class FsrsService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getGameParams(deckId: string, userId: string) {
    const deck = await this.prismaService.deck.findFirst({
      where: {
        id: deckId,
      },
      select: {
        deckCategoryId: true,
        deckSession: {
          select: {
            cardsPerSession: true,
            isShortTerm: true,
          },
        },
        userId: true,
      },
    });

    await this.isUserDeck(deck, userId);

    const weights = await this.prismaService.fSRSWeights.findFirst({
      where: {
        categoryId: deck.deckCategoryId,
      },
      select: {
        w: true,
      },
    });

    return {
      ...weights,
      ...deck.deckSession,
    };
    //cardService
  }

  public async getGameCards(deckId: string, userId: string) {
    const deck = await this.prismaService.deck.findFirst({
      where: {
        id: deckId,
      },
      select: {
        deckSession: {
          select: {
            cardsPerSession: true,
            isShortTerm: true,
          },
        },
        userId: true,
      },
    });

    await this.isUserDeck(deck, userId);
    const now = new Date();

    let cards: TFSRSCardWithCard[];

    if (deck.deckSession.isShortTerm) {
      cards = await this.prismaService.fSRSCard.findMany({
        where: {
          card: {
            deckId,
          },
          due: {
            lte: now,
          },
        },
        orderBy: [{ difficulty: 'desc' }, { stability: 'asc' }, { due: 'asc' }],
        take: deck.deckSession.cardsPerSession,
        include: {
          card: true,
        },
      });
    } else {
      cards = await this.prismaService.fSRSCard.findMany({
        where: {
          card: {
            deckId,
          },
          due: {
            lte: now,
          },
        },
        orderBy: [{ difficulty: 'desc' }, { stability: 'asc' }, { due: 'asc' }],
        take: deck.deckSession.cardsPerSession,
        include: {
          card: true,
        },
      });
    }
    const formattedCards = cards.map(
      ({
        card: {
          plainAnswer,
          plainQuestion,
          createdAt,
          updatedAt,
          ...cardSpread
        },
        cardId,
        id,
        ...val
      }) => ({
        ...cardSpread,
        fsrsCard: { ...val },
      }),
    );

    return formattedCards;
  }

  private async isUserDeck(deck: Partial<Deck>, userId: string) {
    if (deck.userId !== userId) {
      //TODO: in future with accessRights gonna be solved
      throw new BadRequestException('');
    }
  }
}
