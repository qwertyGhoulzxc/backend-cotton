import { TDeckWithSessionAndCategory } from '@app/@types';
import { TDeckCursor } from '@app/common/decorators';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { DeckService } from './deck.service';
export type CursorPaginationParams = {
  limit: number;
  sortBy: string;
  categories?: string[];
  cursor?: TDeckCursor;
};

@Injectable()
export class PrismaDeckPaginationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly deckService: DeckService,
  ) {}

  public async getDecksByCursor(
    userId: string,
    { categories, sortBy, limit, cursor }: CursorPaginationParams,
  ) {
    const isRelatedSort = ['mastery', 'recent'].includes(sortBy);

    if (isRelatedSort) {
      return this.getDecksSortedByRelated(userId, {
        categories,
        sortBy,
        limit,
        cursor,
      });
    }

    // Стандартная логика
    const { orderBy, where, cursorObj } = this.prismaCursorParams(userId, {
      categories,
      sortBy,
      cursor,
    });

    const decks = await this.prismaService.deck.findMany({
      where,
      take: limit + 1,
      cursor: cursorObj ?? undefined,
      skip: cursorObj ? 1 : 0,
      orderBy,
      include: {
        deckCategory: { select: { name: true, color: true, icon: true } },
        deckSession: true,
      },
    });

    const hasNextPage = decks.length > limit;
    const decksToReturn = hasNextPage ? decks.slice(0, limit) : decks;

    const nextCursor =
      hasNextPage && decksToReturn.length > 0
        ? {
            fieldValue: this.extractFieldValue(
              decksToReturn[decksToReturn.length - 1],
              sortBy,
            ),
            id: decksToReturn[decksToReturn.length - 1].id,
          }
        : null;

    return {
      items: decksToReturn.map((deck) => this.deckService.deckRes(deck)),
      nextCursor,
      hasNextPage,
    };
  }
  private async getDecksSortedByRelated(
    userId: string,
    {
      categories,
      sortBy,
      limit,
      cursor,
    }: {
      categories?: string[];
      sortBy: string;
      limit: number;
      cursor?: { fieldValue: any; id: string };
    },
  ) {
    const where: Prisma.DeckSessionWhereInput = {
      deck: {
        userId,
        ...(categories?.length
          ? {
              deckCategory: {
                name: { in: categories },
              },
            }
          : {}),
      },
    };

    // Сортировка
    const orderBy = (() => {
      switch (sortBy) {
        case 'mastery':
          return [
            { mastery: 'desc' as Prisma.SortOrder },
            { deckId: 'asc' as Prisma.SortOrder },
          ];
        case 'recent':
        default:
          return [
            { updatedAt: 'desc' as Prisma.SortOrder },
            { deckId: 'asc' as Prisma.SortOrder },
          ];
      }
    })();

    // Курсор
    const cursorObj = cursor
      ? (() => {
          switch (sortBy) {
            case 'mastery':
              return {
                mastery: cursor.fieldValue,
                deckId: cursor.id,
              };
            case 'recent':
            default:
              return {
                updatedAt: cursor.fieldValue,
                deckId: cursor.id,
              };
          }
        })()
      : undefined;

    const deckSessions = await this.prismaService.deckSession.findMany({
      where,
      take: limit + 1,
      skip: cursorObj ? 1 : 0,
      cursor: cursorObj,
      orderBy,
      include: {
        deck: {
          include: {
            deckCategory: true,
          },
        },
      },
    });

    const hasNextPage = deckSessions.length > limit;
    const sessionsToReturn = hasNextPage
      ? deckSessions.slice(0, limit)
      : deckSessions;

    const decks = sessionsToReturn.map((s) => ({
      ...s.deck,
      deckSession: s,
    }));

    const nextCursor =
      hasNextPage && sessionsToReturn.length > 0
        ? {
            fieldValue:
              sortBy === 'mastery'
                ? sessionsToReturn[sessionsToReturn.length - 1].mastery
                : sessionsToReturn[sessionsToReturn.length - 1].updatedAt,
            id: sessionsToReturn[sessionsToReturn.length - 1].deckId,
          }
        : null;

    return {
      items: decks.map((deck) => this.deckService.deckRes(deck)),
      nextCursor,
      hasNextPage,
    };
  }

  private prismaCursorParams(
    userId: string,
    {
      categories,
      sortBy,
      cursor,
    }: {
      categories?: string[];
      sortBy: string;
      cursor?: { fieldValue: any; id: string };
    },
  ) {
    // Base where with filters
    const where: Prisma.DeckWhereInput = {
      userId,
      ...(categories?.length
        ? {
            deckCategory: {
              name: { in: categories },
            },
          }
        : {}),
    };

    // Define sorting by sortBy
    const orderBy = (() => {
      switch (sortBy) {
        // case 'mastery':
        //   return [
        //     { deckSession: { mastery: 'desc' as Prisma.SortOrder } },
        //     { id: 'asc' as Prisma.SortOrder },
        //   ];
        case 'cards':
          return [
            { cardCount: 'desc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
        case 'alphabetical':
          return [
            { name: 'asc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
        case 'newest':
          return [
            { createdAt: 'desc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
        // case 'recent':
        //   return [
        //     { deckSession: { updatedAt: 'desc' as Prisma.SortOrder } },
        //     { id: 'asc' as Prisma.SortOrder },
        //   ];
        default:
          return [
            { updatedAt: 'desc' as Prisma.SortOrder },
            { id: 'asc' as Prisma.SortOrder },
          ];
      }
    })();

    // If cursor exists - form cursor object for prisma
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
      // case 'mastery':
      //   return {
      //     deckSession: {
      //       mastery: cursor.fieldValue,
      //     },
      //     ...baseObj,
      //   };
      case 'cards':
        return {
          cardCount: cursor.fieldValue,
          ...baseObj,
        };
      case 'alphabetical':
        return {
          name: cursor.fieldValue,
          ...baseObj,
        };
      case 'newest':
        return {
          createdAt: cursor.fieldValue,
          ...baseObj,
        };
      // case 'recent':
      //   return {
      //     deckSession: {
      //       updatedAt: cursor.fieldValue,
      //     },
      //     ...baseObj,
      //   };
      default:
        return {
          updatedAt: cursor.fieldValue,
          ...baseObj,
        };
    }
  }

  private extractFieldValue(
    deck: TDeckWithSessionAndCategory,
    sortBy: string,
  ): any {
    switch (sortBy) {
      case 'mastery':
        return deck.deckSession?.mastery ?? 0;
      case 'cards':
        return deck.cardCount;
      case 'alphabetical':
        return deck.name;
      case 'newest':
        return deck.createdAt;
      case 'recent':
        return deck.deckSession?.updatedAt ?? new Date(0);
      default:
        return deck.updatedAt;
    }
  }
}
