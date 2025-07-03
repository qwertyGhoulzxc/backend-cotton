import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class DeleteCardsDto {
  @IsUUID()
  deckId: string;

  @IsArray()
  @ArrayMinSize(1)
  deleteCardsId: string[];
}
