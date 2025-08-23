import { Module } from '@nestjs/common';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { PrismaDeckPaginationService } from './prisma-deck.pagination.service';

@Module({
  providers: [DeckService, PrismaDeckPaginationService],
  controllers: [DeckController],
})
export class DeckModule {}
