import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class DeckDto {
  @IsString()
  @Length(1, 20)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  description: string;

  @IsString()
  @MaxLength(20)
  category: string;
}
