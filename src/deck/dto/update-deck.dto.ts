import { Type } from 'class-transformer';
import {
  IsDefined,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CategoryDto } from 'src/categories/dto';

export class UpdateDeckDto {
  @IsUUID()
  deckId: string;

  @IsString()
  @Length(1, 20)
  name: string;

  @IsString()
  @MaxLength(50)
  description: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;
}
