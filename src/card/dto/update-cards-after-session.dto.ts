import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

interface updatedCard {
  id: string;
  ef: number;
  priority: number;
}

export class updateCardsAfterSessionDto {
  @IsUUID()
  deckId: string;

  @IsArray()
  @ArrayMinSize(1)
  updatedCards: updatedCard[];
}
