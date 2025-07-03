import { IsString, IsUUID, Length } from 'class-validator';

export class CreateCardDto {
  @IsUUID()
  deckId: string;

  @IsString()
  @Length(1, 100)
  question: string;

  @IsString()
  @Length(1, 100)
  answer: string;
}
