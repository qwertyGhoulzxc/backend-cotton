import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import {
  CreateCardDto,
  DeleteCardsDto,
  ListCardsDto,
  UpdateCardDto,
  updateCardsAfterSessionDto,
} from './dto';

@Injectable()
export class CardService {
  constructor(private readonly prismaService: PrismaService) {}

  //TODO: like a pages but a bit later
  public async listCards(dto: ListCardsDto) {
    const deck = await this.prismaService.deck.findFirst({
      where: {
        id: dto.deckId,
      },
      select: {
        cards: true,
      },
    });
    if (!Array.isArray(deck.cards))
      throw new BadRequestException("The deck doesn't exist");
    return deck.cards;
  }

  public async createCard(dto: CreateCardDto, userId: string) {
    await this.isUserDeck(userId, dto.deckId);
    const [card] = await Promise.all([
      this.prismaService.card.create({
        data: {
          ...dto,
        },
      }),
      this.prismaService.deck.update({
        where: { id: dto.deckId },
        data: {
          cardCount: { increment: 1 },
        },
      }),
    ]);
    return card;
  }

  public async updateCard(dto: UpdateCardDto, userId: string) {
    await this.isUserDeck(userId, dto.deckId);
    const updatedCard = await this.prismaService.card.update({
      where: {
        id: dto.cardId,
      },
      data: {
        answer: dto.answer,
        question: dto.question,
      },
    });
    if (!updatedCard)
      throw new BadRequestException('No such card with this id');
    return updatedCard;
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

  public async updateCardsAfterSession(
    dto: updateCardsAfterSessionDto,
    userId: string,
  ) {
    await this.isUserDeck(userId, dto.deckId);
    try {
      await Promise.all(
        dto.updatedCards.map((card) =>
          this.prismaService.card.update({
            where: { id: card.id },
            data: {
              ef: card.ef,
              priority: card.priority,
            },
          }),
        ),
      );
    } catch (error) {
      console.error('Failed to update cards after session:', error);
      throw new InternalServerErrorException('Не удалось обновить карточки');
    }
    return;
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
}
