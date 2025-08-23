import { ValidateHtmlLength } from '@app/common/decorators';
import { IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateCardDto {
  @IsUUID()
  cardId: string;

  @IsUUID()
  deckId: string;

  @IsString()
  @MaxLength(700)
  @ValidateHtmlLength(1, 200)
  question: string;

  @IsString()
  @MaxLength(700)
  @ValidateHtmlLength(1, 200)
  answer: string;
}
