import {
  ALLOWED_DECK_SORT_BY,
  DEFAULT_PAGINATION,
} from '@app/common/constants';
import { CurrentUser, DeckCursor, TDeckCursor } from '@app/common/decorators';
import { ParseDeckSortByPipe } from '@app/common/pipes';
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
import { DeckService } from './deck.service';
import { DeckDto, UpdateDeckDto } from './dto';
import { PrismaDeckPaginationService } from './prisma-deck.pagination.service';

@Controller('deck')
export class DeckController {
  constructor(
    private readonly deckService: DeckService,
    private readonly prismaDeckPaginationService: PrismaDeckPaginationService,
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
    console.log(dto);

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
  public async listUserDecksCursor(
    @CurrentUser('id') userId: string,
    @Query(
      'limit',
      new DefaultValuePipe(DEFAULT_PAGINATION.limit),
      ParseIntPipe,
    )
    limit: number,
    @Query('categories') _categories: string,
    @Query('sortBy', ParseDeckSortByPipe)
    sortBy: (typeof ALLOWED_DECK_SORT_BY)[number],
    @DeckCursor('sortBy') cursor: TDeckCursor | null,
  ) {
    const categories = _categories ? _categories.split(',') : undefined;

    return this.prismaDeckPaginationService.getDecksByCursor(userId, {
      limit: limit,
      sortBy,
      categories,
      cursor,
    });
  }
}
