import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class FsrsCardDto {
  @Type(() => Date)
  @IsDate()
  due: Date;

  @IsNumber()
  stability: number;

  @IsNumber()
  difficulty: number;

  @IsNumber()
  elapsed_days: number;

  @IsNumber()
  scheduled_days: number;

  @IsNumber()
  learning_steps: number;

  @IsNumber()
  reps: number;

  @IsNumber()
  lapses: number;

  @IsNumber()
  state: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  last_review?: Date;
}
