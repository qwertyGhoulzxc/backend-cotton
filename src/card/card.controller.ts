import { CurrentUser } from '@app/common/decorators';
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CardService } from './card.service';
import {
  CreateCardDto,
  DeleteCardsDto,
  UpdateCardDto,
  updateCardsAfterSessionDto,
} from './dto';

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

  @Patch('update-cards-after-session')
  public async updateCardsAfterSession(
    @Res() res: Response,
    @Body() dto: updateCardsAfterSessionDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.cardService.updateCardsAfterSession(dto, userId);
    return res.sendStatus(HttpStatus.OK);
  }
}
