import { DEFAULT_PAGINATION } from '@app/common/constants';
import { CurrentUser } from '@app/common/decorators';
import { CardService } from '@card/card.service';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
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

  //TODO: pagination
  @Get('list-user-decks')
  public async listUserDecks(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(DEFAULT_PAGINATION.page), ParseIntPipe)
    page: number,
    @Query(
      'limit',
      new DefaultValuePipe(DEFAULT_PAGINATION.limit),
      ParseIntPipe,
    )
    limit: number,
    @Query('categories') cat: string,
  ) {
    console.log(cat);

    return this.deckService.listUserDecks(userId, page, limit);
  }

  @Get('list-deck-cards/:id')
  public async getDeckCards(@Param('id') deckId: string) {
    return this.cardService.listCards({ deckId });
  }
}
