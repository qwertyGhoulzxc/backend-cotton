import {
  ALLOWED_CARD_SORT_BY,
  DEFAULT_PAGINATION,
} from '@app/common/constants';
import { CardCursor, CurrentUser, TCardCursor } from '@app/common/decorators';
import { ParseCardSortByPipe, TrimSearchPipe } from '@app/common/pipes';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CardService } from './card.service';
import { CreateCardDto, DeleteCardsDto, UpdateCardDto } from './dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}
  //TODO: add logic with the smt like list a - b and etc.
  @Post('create-card')
  public async createCard(
    @Body() dto: CreateCardDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cardService.createCard(dto, userId);
  }

  @Get('get-card-by-id')
  public async getCardById(
    @Query('deckId', ParseUUIDPipe) deckId: string,
    @Query('cardId', ParseUUIDPipe) cardId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cardService.getCardById(deckId, cardId, userId);
  }

  @Patch('update-card')
  public async updateCard(
    @Body() dto: UpdateCardDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cardService.updateCard(dto, userId);
  }

  @Delete('delete-cards')
  public async deleteCards(
    @Body() dto: DeleteCardsDto,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    await this.cardService.deleteCardsById(dto, userId);
    return res.sendStatus(HttpStatus.OK);
  }

  @Get('list-cards/:deckId')
  public async listCards(
    @Param('deckId', ParseUUIDPipe) deckId: string,
    @CurrentUser('id') userId: string,
    @Query(
      'limit',
      new DefaultValuePipe(DEFAULT_PAGINATION.limit),
      ParseIntPipe,
    )
    limit: number,
    @Query('sortBy', ParseCardSortByPipe)
    sortBy: (typeof ALLOWED_CARD_SORT_BY)[number],
    @Query('search', TrimSearchPipe) search: string | null,
    @CardCursor() cursor: TCardCursor | null,
  ) {
    const params = {
      limit,
      sortBy,
      search,
      cursor,
    };
    return this.cardService.listCards(userId, deckId, params);
  }
}
