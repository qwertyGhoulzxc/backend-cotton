import { Module } from '@nestjs/common';
import { CardModule } from 'src/card/card.module';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';

@Module({
  imports: [CardModule],
  providers: [DeckService],
  controllers: [DeckController],
})
export class DeckModule {}
