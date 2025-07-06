import { ALLOWED_COLORS, ALLOWED_ICONS } from '@app/common/constants';
import { IsIn, IsString } from 'class-validator';

export class CategoryDto {
  @IsString()
  name: string;
  @IsString()
  @IsIn(ALLOWED_COLORS)
  color: string;
  @IsString()
  @IsIn(ALLOWED_ICONS)
  icon: string;
}
