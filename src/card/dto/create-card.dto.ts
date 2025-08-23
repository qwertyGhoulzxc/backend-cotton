import { ValidateHtmlLength } from '@app/common/decorators';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Card } from 'ts-fsrs';
import { FsrsCardDto } from './fsrs-card.dto';

export class CreateCardDto {
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

  @IsDefined()
  @ValidateNested()
  @Type(() => FsrsCardDto)
  fsrsCard: Card;
}
