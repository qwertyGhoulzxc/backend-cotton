import { TDeckWithSessionAndCategory } from '@app/@types';
import { convertSecondsToReadableFormat } from '@app/common/utils';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { formatDistanceToNow } from 'date-fns';
import { DeckDto, UpdateDeckDto } from './dto';

@Injectable()
export class DeckService {
  constructor(private readonly prismaService: PrismaService) {}

  public async createDeck(userId: string, dto: DeckDto) {
    const category = await this.prismaService.deckCategory.upsert({
      where: {
        userId_name: {
          name: dto.category,
          userId,
        },
      },
      create: {
        userId,
        name: dto.category,
      },
      update: {},
    });
    const deck = await this.prismaService.deck.create({
      data: {
        name: dto.name,
        description: dto.description,
        userId,
        deckCategoryId: category.id,
        deckSession: { create: {} },
      },
      include: {
        deckCategory: {
          select: {
            name: true,
          },
        },
        deckSession: {
          select: {
            mastery: true,
            totalTime: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!deck) throw new BadRequestException('Something went wrong');

    return this.deckRes(deck);
  }

  private deckRes(deck: TDeckWithSessionAndCategory) {
    const {
      updatedAt,
      deckCategoryId,
      userId,
      deckSession,
      deckCategory,
      ...dto
    } = deck;
    return {
      ...dto,
      category: deckCategory.name,
      mastery: deckSession.mastery,
      totalTime: convertSecondsToReadableFormat(deckSession.totalTime),
      lastStudied: this.lastStudied(
        deckSession.updatedAt,
        deckSession.totalTime,
      ),
    };
  }

  private lastStudied(updatedAt: Date, totalTime: number) {
    if (totalTime === 0) return 'Time to start learning!';
    return `${formatDistanceToNow(updatedAt, {
      addSuffix: true,
    })}`;
  }

  public async getDeckCards() {}

  public async listUserDecks(userId: string, page: number, limit: number) {
    const [decks, totalCount] = await Promise.all([
      this.prismaService.deck.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          deckCategory: {
            select: {
              name: true,
            },
          },
          deckSession: {
            select: {
              mastery: true,
              totalTime: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
      this.prismaService.deck.count({
        where: { userId },
      }),
    ]);
    if (!Array.isArray(decks))
      throw new InternalServerErrorException('Something went wrong');

    return {
      items: decks.map((val) => this.deckRes(val)),
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
    };
  }

  public async updateDeck(dto: UpdateDeckDto, userId: string) {
    const deck = await this.prismaService.deck
      .update({
        where: {
          userId,
          id: dto.deckId,
        },
        data: {
          ...dto,
        },
        include: {
          deckCategory: {
            select: {
              name: true,
            },
          },
          deckSession: {
            select: {
              mastery: true,
              totalTime: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      })
      .catch((err) => {
        throw new BadRequestException('No such user with this deck');
      });

    if (!deck) throw new BadRequestException('No such user with this deck');
    if (deck.deckCategory.name !== dto.category) {
      const newCategory = await this.prismaService.deckCategory.upsert({
        where: {
          userId_name: {
            name: dto.category,
            userId,
          },
        },
        create: { name: dto.category, userId },
        update: {},
      });

      await this.prismaService.deck.update({
        where: { id: deck.id },
        data: { deckCategoryId: newCategory.id },
      });
      deck.deckCategory.name = dto.category;
    }
    return this.deckRes(deck);
  }

  public async deleteDeck(deckId: string, userId: string) {
    const deck = await this.prismaService.deck
      .delete({
        where: {
          userId,
          id: deckId,
        },
      })
      .catch((err) => {
        throw new BadRequestException('No such user with this deck');
      });
    if (!deck) throw new BadRequestException('No such user with this deck');
    return;
  }
}
