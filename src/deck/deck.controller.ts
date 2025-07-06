import { ALLOWED_SORT_BY } from '@app/common/constants';
import {
  CurrentUser,
  Pagination,
  PaginationParams,
} from '@app/common/decorators';
import { ParseSortByPipe } from '@app/common/pipes';
import { CardService } from '@card/card.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { DeckService } from './deck.service';
import { DeckDto, UpdateDeckDto } from './dto';

@Controller('deck')
export class DeckController {
  constructor(
    private readonly deckService: DeckService,
    private readonly cardService: CardService,
  ) {}
  //TODO: maybe automatically add cards with a creation
  @Post('create-deck')
  public async createDeck(
    @Body() dto: DeckDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deckService.createDeck(userId, dto);
  }

  @Get('get-deck/:id')
  public async getDeckById(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) deckId: string,
  ) {
    return this.deckService.getDeckById(userId, deckId);
  }

  @Patch('update-deck')
  public async updateDeck(
    @Body() dto: UpdateDeckDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deckService.updateDeck(dto, userId);
  }

  @Delete('delete-deck/:id')
  public async deleteDeck(
    @Param('id') deckId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    await this.deckService.deleteDeck(deckId, userId);
    return res.sendStatus(HttpStatus.OK);
  }

  @Get('list-user-decks')
  public async listUserDecks(
    @CurrentUser('id') userId: string,
    @Pagination() pagination: PaginationParams,
    @Query('categories') _categories: string,
    @Query('sortBy', ParseSortByPipe) sortBy: (typeof ALLOWED_SORT_BY)[number],
  ) {
    const { limit, page } = pagination;
    const categories = _categories ? _categories.split(',') : undefined;
    const params = { page, limit, categories: categories, sortBy };

    return this.deckService.listUserDecks(userId, params);
  }
}
