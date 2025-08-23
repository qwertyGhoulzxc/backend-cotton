import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { PrismaCardPaginationService } from './prisma-card.pagination.service';

@Module({
  providers: [CardService, PrismaCardPaginationService],
  controllers: [CardController],
  exports: [CardService],
})
export class CardModule {}
