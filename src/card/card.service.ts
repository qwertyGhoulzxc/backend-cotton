import { BadRequestException, Injectable } from '@nestjs/common';
import { Card } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { decode } from 'html-entities';
import { CreateCardDto, DeleteCardsDto, UpdateCardDto } from './dto';
import { PrismaCardPaginationService } from './prisma-card.pagination.service';
import { cardWithoutPlain } from './responses';
import { TCardSearchParams } from './types';

@Injectable()
export class CardService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly prismaCardPaginationService: PrismaCardPaginationService,
  ) {}

  public async createCard(dto: CreateCardDto, userId: string) {
    const { plainAnswer, plainQuestion } = this.plainText({
      answer: dto.answer,
      question: dto.question,
    });

    await this.isUserDeck(userId, dto.deckId);
    const [card] = await Promise.all([
      this.prismaService.card.create({
        data: {
          plainAnswer,
          plainQuestion,
          answer: dto.answer,
          question: dto.question,
          deckId: dto.deckId,
          fsrsCard: { create: { ...dto.fsrsCard } },
        },
      }),
      this.prismaService.deck.update({
        where: { id: dto.deckId },
        data: {
          cardCount: { increment: 1 },
        },
      }),
    ]);
    return cardWithoutPlain(card);
  }

  public async getCardById(deckId: string, cardId: string, userId: string) {
    await this.isUserDeck(userId, deckId);
    const card = await this.prismaService.card.findFirst({
      where: {
        deckId,
        id: cardId,
      },
    });
    if (!card) throw new BadRequestException("This card doesn't exits");
    return cardWithoutPlain(card);
  }

  public async updateCard(dto: UpdateCardDto, userId: string) {
    await this.isUserDeck(userId, dto.deckId);
    const { plainAnswer, plainQuestion } = this.plainText({
      answer: dto.answer,
      question: dto.question,
    });
    const updatedCard = await this.prismaService.card.update({
      where: {
        id: dto.cardId,
      },
      data: {
        plainQuestion,
        plainAnswer,
        answer: dto.answer,
        question: dto.question,
      },
    });
    if (!updatedCard)
      throw new BadRequestException('No such card with this id');
    return cardWithoutPlain(updatedCard);
  }

  public async deleteCardsById(dto: DeleteCardsDto, userId: string) {
    await this.isUserDeck(userId, dto.deckId);

    await Promise.all([
      this.prismaService.card.deleteMany({
        where: {
          id: { in: dto.deleteCardsId },
        },
      }),
      this.prismaService.deck.update({
        where: { id: dto.deckId },
        data: {
          cardCount: { decrement: dto.deleteCardsId.length },
        },
      }),
    ]);
  }

  private async isUserDeck(userId: string, deckId: string) {
    const isUserDeck = await this.prismaService.deck.findFirst({
      where: {
        userId,
        id: deckId,
      },
    });
    if (!isUserDeck) throw new BadRequestException("The deck doesn't exist");
  }

  private plainText({ answer, question }: Partial<Card>) {
    let plainAnswer = answer.replace(/<[^>]+>/g, '');
    let plainQuestion = question.replace(/<[^>]+>/g, '');

    plainAnswer = plainAnswer.replace(/\s+/g, ' ').trim();
    plainQuestion = plainQuestion.replace(/\s+/g, ' ').trim();

    return {
      plainAnswer: decode(plainAnswer),
      plainQuestion: decode(plainQuestion),
    };
  }

  public async listCards(
    userId: string,
    deckId: string,
    params: TCardSearchParams,
  ) {
    await this.isUserDeck(userId, deckId);

    return this.prismaCardPaginationService.getCardsByCursor(deckId, params);
  }
}
