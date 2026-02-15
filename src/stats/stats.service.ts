import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async getDashboardStats(userId: string) {
    const [aggregates, recentDecks] = await Promise.all([
      // ЗАПРОС 1: Агрегация (Считаем общее время и кол-во колод)
      // Мы обращаемся к таблице DeckSession (или где у тебя время), фильтруя по юзеру
      this.prismaService.deckSession.aggregate({
        where: {
          deck: { userId: userId },
        },
        _sum: {
          totalTime: true, //sum of all time have spent
        },
        _count: {
          deckId: true, //Sum of all decks
        },
      }),

      //Last decks was trained
      this.prismaService.deck.findMany({
        where: { userId: userId },
        take: 3,
        orderBy: {
          deckSession: { updatedAt: 'desc' },
        },
        select: {
          id: true,
          name: true,
          deckCategory: {
            select: {
              icon: true,
              color: true,
            },
          },
          deckSession: {
            select: {
              updatedAt: true,
              mastery: true,
            },
          },
        },
      }),
    ]);

    const totalSeconds = aggregates._sum.totalTime || 0;
    return {
      totalDecks: aggregates._count.deckId,
      studyTimeHours: Number((totalSeconds / 3600).toFixed(1)),

      recentActivity: recentDecks.map((deck) => ({
        id: deck.id,
        title: deck.name,
        icon: deck.deckCategory.icon,
        color: deck.deckCategory.color,
        lastStudied: deck.deckSession?.updatedAt || new Date(),
        mastery: deck.deckSession?.mastery || 0,
      })),
    };
  }
}
