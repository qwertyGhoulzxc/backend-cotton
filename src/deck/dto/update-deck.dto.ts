import { IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class UpdateDeckDto {
  @IsUUID()
  deckId: string;

  @IsString()
  @Length(1, 20)
  name: string;

  @IsString()
  @MaxLength(50)
  description: string;

  @IsString()
  @MaxLength(20)
  category: string;
}
