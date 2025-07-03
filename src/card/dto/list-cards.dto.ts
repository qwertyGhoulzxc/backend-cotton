import { IsUUID } from 'class-validator';

export class ListCardsDto {
  @IsUUID()
  deckId: string;
}
