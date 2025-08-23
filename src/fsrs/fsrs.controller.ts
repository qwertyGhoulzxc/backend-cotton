import { CurrentUser } from '@app/common/decorators';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { FsrsService } from './fsrs.service';

@Controller('fsrs')
export class FsrsController {
  constructor(private readonly fsrsService: FsrsService) {}

  @Get('game-params/:deckId')
  public async getGameParams(
    @CurrentUser('id') userId: string,
    @Param('deckId', ParseUUIDPipe) deckId: string,
  ) {
    return this.fsrsService.getGameParams(deckId, userId);
  }

  @Get('game-cards/:deckId')
  public async getGameCards(
    @Param('deckId') deckId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.fsrsService.getGameCards(deckId, userId);
  }
}
