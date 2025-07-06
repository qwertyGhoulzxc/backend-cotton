import { Type } from 'class-transformer';
import {
  IsDefined,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CategoryDto } from 'src/categories/dto';

export class DeckDto {
  @IsString()
  @Length(1, 20)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;
}
