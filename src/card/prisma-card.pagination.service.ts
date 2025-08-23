import { TCardWithFSRSCard } from '@app/@types';
import { ALLOWED_CARD_SORT_BY } from '@app/common/constants';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { formatDistanceToNow } from 'date-fns';

export interface TCardCursor {
  id: string;
  fieldValue: string | number | Date;
}

export type CardCursorParams = {
  limit: number;
  sortBy: string;
  search?: string;
  cursor?: TCardCursor;
};

@Injectable()
export class PrismaCardPaginationService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getCardsByCursor(deckId: string, params: CardCursorParams) {
    const { limit, sortBy, search, cursor } = params;

    if (!ALLOWED_CARD_SORT_BY.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy value: ${sortBy}`);
    }

    const isRelatedSort = ['hardest', 'easiest'].includes(sortBy);

    if (isRelatedSort) {
      //
      return this.getCardsSortedByRelated(deckId, {
        sortBy,
        search,
        limit,
        cursor,
      });
    }

    const { cursorObj, orderBy, where } = this.prismaCursorParams(deckId, {
      sortBy,
      search,
      cursor,
    });

    const cards = await this.prismaService.card.findMany({
      where,
      take: limit + 1,
      cursor: cursorObj ?? undefined,
      skip: cursor ? 1 : 0,
      orderBy,
      include: {
        fsrsCard: true,
      },
    });
    const hasNextPage = cards.length > limit;
    const cardsToReturn = hasNextPage ? cards.slice(0, limit) : cards;

    const nextCursor =
      hasNextPage && cardsToReturn.length > 0
        ? {
            fieldValue: this.extractFieldValue(
              cardsToReturn[cardsToReturn.length - 1],
              sortBy,
            ),
            id: cardsToReturn[cardsToReturn.length - 1].id,
          }
        : null;

    const formattedCards = cardsToReturn.map(
      ({ plainQuestion, plainAnswer, ...val }) => ({
        ...val,
        last_review_display: val.fsrsCard?.last_review
          ? formatDistanceToNow(val.fsrsCard.last_review, { addSuffix: true })
          : 'Time to start learning!',
      }),
    );

    return {
      items: formattedCards,
      nextCursor,
      hasNextPage,
    };
  }

  private prismaCursorParams(
    deckId: string,
    {
      sortBy,
      cursor,
      search,
    }: {
      sortBy: string;
      search: string | null;
      cursor?: { fieldValue: any; id: string };
    },
  ) {
    const where: Prisma.CardWhereInput = {
      deckId,
      ...(search?.length > 0
        ? {
            OR: [
              { plainAnswer: { contains: search, mode: 'insensitive' } },
              { plainQuestion: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy = (() => {
      switch (sortBy) {
        case 'newest':
          return [
            { createdAt: 'desc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
        case 'oldest':
          return [
            { createdAt: 'asc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
        default:
          return [
            { createdAt: 'desc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
      }
    })();

    const cursorObj = cursor
      ? this.buildCursorObject(cursor, sortBy)
      : undefined;
    return { where, orderBy, cursorObj };
  }

  private buildCursorObject(
    cursor: { fieldValue: any; id: string },
    sortBy: string,
  ): any {
    const baseObj = { id: cursor.id };

    switch (sortBy) {
      case 'newest':
        return {
          createdAt: cursor.fieldValue,
          ...baseObj,
        };
      default:
        return {
          createdAt: cursor.fieldValue,
          ...baseObj,
        };
    }
  }

  private extractFieldValue(card: TCardWithFSRSCard, sortBy: string): any {
    switch (sortBy) {
      case 'newest':
        return card.createdAt;
      case 'oldest':
        return card.createdAt;
    }
  }

  private async getCardsSortedByRelated(
    deckId: string,
    {
      sortBy,
      limit,
      cursor,
      search,
    }: {
      sortBy: string;
      limit: number;
      cursor?: { fieldValue: any; id: string };
      search?: string;
    },
  ) {
    const where: Prisma.FSRSCardWhereInput = {
      card: {
        deckId,
        ...(search?.length > 0
          ? {
              OR: [
                { plainAnswer: { contains: search, mode: 'insensitive' } },
                { plainQuestion: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    };

    const orderBy = (() => {
      switch (sortBy) {
        case 'hardest':
          return [
            { difficulty: 'desc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
        case 'easiest':
          return [
            { difficulty: 'asc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
        default:
          return [
            { difficulty: 'desc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
      }
    })();

    const cursorObj = cursor
      ? {
          difficulty: cursor.fieldValue,
          id: cursor.id,
        }
      : undefined;

    const fsrsCards = await this.prismaService.fSRSCard.findMany({
      where,
      take: limit + 1,
      skip: cursorObj ? 1 : 0,
      cursor: cursorObj,
      orderBy,
      include: {
        card: true,
      },
    });

    const hasNextPage = fsrsCards.length > limit;
    const fsrsCardsToReturn = hasNextPage
      ? fsrsCards.slice(0, limit)
      : fsrsCards;

    const cards = fsrsCardsToReturn.map((s) => {
      const { plainAnswer, plainQuestion, ...cardWithoutPlain } = s.card;

      return {
        ...cardWithoutPlain,
        fsrsCard: s,
      };
    });

    const nextCursor =
      hasNextPage && fsrsCardsToReturn.length > 0
        ? {
            id: fsrsCardsToReturn[fsrsCardsToReturn.length - 1].id,
            fieldValue:
              fsrsCardsToReturn[fsrsCardsToReturn.length - 1].difficulty,
          }
        : null;

    return {
      items: cards,
      nextCursor,
      hasNextPage,
    };
  }
}
